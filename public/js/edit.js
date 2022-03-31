(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.validation')
    const update = document.querySelector('.update-text');
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }else{
            update.textContent = 'Updating...';
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()
  let getDataWhenScroll = true;
  const id = document.querySelector('.id').innerText;
  async function postme(){
    const res = await axios.post(`/${id}/sendme`);
   return res.data;

}




 

let nextPageToken = null;
var clicked = false;




//select box js
const searchBox = document.querySelector(".search-box input");
const container = document.querySelector(".containers");
const selected = document.querySelector(".selected");
const optionsContainers = document.querySelector(".options-containers");

let optionsList = document.querySelectorAll(".option");
let initialClicked = true;
selected.addEventListener("click", async () => {
  optionsContainers.classList.toggle("active"); 
  //adding focus whenever clicked
  if(optionsContainers.classList.contains('active')){
    searchBox.focus();
  }

  //adding reset
  searchBox.value = '';
  filterList('');
  getDataWhenScroll = true;
  if(initialClicked) {
    if(initialClicked) {
      searchBox.placeholder = 'Generating emails...'
      const res = await postme();
      searchBox.placeholder = 'Search email'
      const emails = res.respondEmail;
       nextPageToken = res.nextPageToken;
       
       
       selected.parentElement.parentElement.nextPageToken = nextPageToken;
       //adding filter of repeatidy
       
       emails.forEach((email)=>{
        let originalArray = Array.prototype.slice.call(document.querySelectorAll('.containers')[0].querySelectorAll(".option"));
        let counter = 0;
          originalArray.forEach((input)=>{
            if(input.textContent == email){
              counter++;
            }
          })
          if(!counter){
            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('option');
            const input = document.createElement('input');
            input.type = 'radio';
            input.classList.add('radio');
            
            input.name = email;
            optionsContainer.appendChild(input);
            const label = document.createElement('label');
            label.htmlFor = email;
            label.innerText = email;
            optionsContainer.appendChild(label);
            optionsContainers.append(optionsContainer);
      
      
            //selection logic
            
              
            
                optionsContainer.addEventListener("click", () => {
                  selected.innerHTML = optionsContainer.querySelector("label").innerHTML;

                  optionsContainer.parentElement.parentElement.parentElement.previousElementSibling.lastElementChild.lastElementChild.value = optionsContainer.innerText;
                  // optionsContainer.parentElement.parentElement.parentElement.previousElementSibling.value = optionsContainer.innerText;
                  optionsContainers.classList.remove("active");
                });
             
      
                //search input
      searchBox.addEventListener("keyup", function(e) {
        if(e.target.value){
          getDataWhenScroll = false;
            filterList(e.target.value);}
            else{
              getDataWhenScroll = true;
            }
        
      });
      
      const filterList = searchTerm => {
        searchTerm = searchTerm.toLowerCase();
       
          let label = optionsContainer.firstElementChild.nextElementSibling.innerText.toLowerCase();
          if (label.indexOf(searchTerm) != -1) {
            optionsContainer.style.display = "block";
          } else {
            optionsContainer.style.display = "none";
          }
       
      };
        
          }
              
      })
      
      if(initialClicked) initialClicked = false;}
    }
  
});

optionsList.forEach(o => {
  o.addEventListener("click", () => {
    selected.innerHTML = o.querySelector("label").innerHTML;
   
    o.parentElement.parentElement.parentElement.previousElementSibling.lastElementChild.lastElementChild.value = o.innerText;
    optionsContainers.classList.remove("active");
  });
});


//search input
searchBox.addEventListener("keyup", function(e) {

  if(e.target.value){
      getDataWhenScroll = false;
        filterList(e.target.value);}
        else{
          getDataWhenScroll = true;
        }
  });
  
  const filterList = searchTerm => {
    searchTerm = searchTerm.toLowerCase();
    optionsList.forEach(option => {
      let label = option.firstElementChild.nextElementSibling.innerText.toLowerCase();
      if (label.indexOf(searchTerm) != -1) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    });
  };

  optionsContainers.addEventListener('scroll',async()=>{
      const {scrollTop,scrollHeight,clientHeight} = optionsContainers;
    
      if(getDataWhenScroll){
          if(scrollTop+clientHeight === scrollHeight){
            let emails = null;
            optionsList = document.querySelectorAll(".option");
          getDataWhenScroll = false;

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('option');
        const label = document.createElement('label');
        label.innerText = "getting more emails..";
        optionsContainer.appendChild(label);
        optionsContainers.append(optionsContainer);
   
        const {data} = await axios.post(`/${id}/nextpage`,{
            nextPageToken
        });

        optionsContainers.removeChild(optionsContainer);
        emails  = data.respondEmail

        nextPageToken = data.nextPageToken;
        
        selected.parentElement.parentElement.nextPageToken = nextPageToken;
     emails.forEach((email)=>{
      let originalArray = Array.prototype.slice.call(document.querySelectorAll(".containers")[0].querySelectorAll(".option"));
      let counter = 0;
        originalArray.forEach((input)=>{
          if(input.textContent == email){
            counter++;
          }
        })
        if(!counter){const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('option');
        const input = document.createElement('input');
        input.type = 'radio';
        input.classList.add('radio');
        
        input.name = 'category';
        optionsContainer.appendChild(input);
        const label = document.createElement('label');
        label.htmlFor = email;
        label.innerText = email;
        optionsContainer.appendChild(label);
        optionsContainers.append(optionsContainer);


        //selection logic in scrolled new data
        
          
            console.dir(optionsContainer)
            optionsContainer.addEventListener("click", () => {
              selected.innerHTML = optionsContainer.querySelector("label").innerHTML;
           
              optionsContainer.parentElement.parentElement.parentElement.previousElementSibling.lastElementChild.lastElementChild.value = optionsContainer.innerText;

              // optionsContainer.parentElement.parentElement.parentElement.previousElementSibling.value = optionsContainer.innerText;
              optionsContainers.classList.remove("active");
            });
         

            //search input in scrolled new data
searchBox.addEventListener("keyup", function(e) {
    filterList(e.target.value);
  });
  
  const filterList = searchTerm => {
    searchTerm = searchTerm.toLowerCase();
   
      let label = optionsContainer.firstElementChild.nextElementSibling.innerText.toLowerCase();
      if (label.indexOf(searchTerm) != -1) {
        optionsContainer.style.display = "block";
      } else {
        optionsContainer.style.display = "none";
      }
   
  };
   }
               
    })
getDataWhenScroll = true;
      }}
      
  })
  
  //handling divs of update
  const edit = document.querySelectorAll('.edit');

  const deletediv = document.querySelectorAll('.delete');

  edit.forEach(editdiv=>{
    editdiv.addEventListener('click',(e)=>{
      editdiv.querySelector('.editButton').click();
    })
  })
  deletediv.forEach(deleteidiv=>{
    deleteidiv.addEventListener('click',()=>{
      deleteidiv.querySelector('.deletebutton').click();
    })
  })