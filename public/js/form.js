let getDataWhenScroll = true;
const id = document.querySelector('.id').innerText;


const form = document.querySelector('.folderForm');
const addMore = document.querySelector('.increment');
const remove = document.querySelector('.decrement');

const searchBox = document.querySelector(".search-box input");
const container = document.querySelector(".containers");



let i = 2;
if(i == 2 ) remove.disabled = true;

function add(){
    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group','row');
    const label = document.createElement('label');
    label.textContent = `Folder ${i}`;
    label.classList.add('col-sm-2','col-form-label');
    formGroup.appendChild(label);
    const col = document.createElement('div');
    col.classList.add('col-sm-10');
    const labelInput = document.createElement('input');
    labelInput.placeholder = 'Enter Your Folder Name';
    labelInput.name = `input${i}[name]`;
    labelInput.required = true;
    labelInput.classList.add('form-control');
    col.append(labelInput);
    formGroup.append(col);

    //creating form group for email input
    const formGroup2 = document.createElement('div');
    formGroup2.classList.add('form-group','row')
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    emailLabel.classList.add('col-sm-2','col-form-label');
    formGroup2.append(emailLabel);
    const col2 = document.createElement('div');
    col2.classList.add('col-sm-10');
    const emailInput = document.createElement('input');
    emailInput.placeholder = "Enter sender's Email or Select from dropdown";
    emailInput.type = 'email';
    emailInput.name = `input${i}[searchEmail]`;
    emailInput.required = true;
    emailInput.classList.add('form-control');
    col2.append(emailInput);
    formGroup2.append(col2);

    const containers = document.querySelectorAll(".containers");
    const container = containers[containers.length-1]
    const cloneContainer = container.cloneNode(true);
    cloneContainer.classList.add('new-container');
    cloneContainer.cloneIt = cloneIt;
    
    form.insertBefore(formGroup,form.lastElementChild);
    form.insertBefore(formGroup2,form.lastElementChild);
    form.insertBefore(cloneContainer,form.lastElementChild);
    cloneContainer.cloneIt(i);


    i++;
}
function decrement(){
 
    form.removeChild(form.lastElementChild.previousElementSibling);
    form.removeChild(form.lastElementChild.previousElementSibling);
    form.removeChild(form.lastElementChild.previousElementSibling);

    
    
    i--;

} 
addMore.addEventListener('click',()=>{
    add();
    remove.disabled = false;
})
remove.addEventListener('click',()=>{
    decrement();
    if(i == 2) {remove.disabled = true;}else {remove.disabled = false};
})

async function postme(){
    const res = await axios.post(`/${id}/sendme`);
   return res.data;

}




 

let nextPageToken = null;
var clicked = false;




//select box js

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
  

  //building a function to handle
  function cloneIt(j){
    //setting email value so that it doesnt allow it to show
    
    const selectBox  = this.lastChild.previousElementSibling;
   
    const optionsContainers = selectBox.firstChild.nextElementSibling;

   optionsContainers.classList.remove('active')
    const selected = optionsContainers.nextElementSibling;
    selected.textContent = 'Select from existing emails';
    // const searchBox = selectBox.lastElementChild;
    const searchBox = this.querySelector(".search-box input");

    
let nextPageToken = this.previousElementSibling.previousElementSibling.previousElementSibling.nextPageToken;
this.nextPageToken = nextPageToken;
('from clone',nextPageToken);
let optionsList = this.querySelectorAll(".option");

let initialClicked = true;
let getDataWhenScroll = true;
selected.addEventListener("click", async () => {
  optionsContainers.classList.toggle("active"); 
  if(optionsContainers.classList.contains('active')){
    searchBox.focus();
  }

  //adding reset
  searchBox.value = '';
  filterList('');
  getDataWhenScroll = true;


  if(initialClicked ) {
    if(initialClicked) {
      if(!nextPageToken){
        searchBox.placeholder = 'Generating emails...'
        const res = await postme();
        searchBox.placeholder = 'Search email'
        const emails = res.respondEmail;
         nextPageToken = res.nextPageToken;
         selected.parentElement.parentElement.nextPageToken = nextPageToken;
         emails.forEach((email)=>{
          let originalArray = Array.prototype.slice.call(this.querySelectorAll(".option"));
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
      
      
            //selection logic in new data
            
              
            
                optionsContainer.addEventListener("click", () => {
                  selected.innerHTML = optionsContainer.querySelector("label").innerHTML;
                  optionsContainer.parentElement.parentElement.parentElement.previousElementSibling.lastElementChild.lastElementChild.value = optionsContainer.innerText;

                  optionsContainers.classList.remove("active");
                });
             
      
                //search input in new data
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
                 
        })}
      
      if(initialClicked) initialClicked = false;}
    }
  
});

optionsList.forEach(o => {
  o.addEventListener("click", (e) => {
    
  
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
      let originalArray = Array.prototype.slice.call(this.querySelectorAll(".option"));
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
        
          
        
            optionsContainer.addEventListener("click", () => {
              selected.innerHTML = optionsContainer.querySelector("label").innerHTML;
              optionsContainer.parentElement.parentElement.parentElement.previousElementSibling.lastElementChild.lastElementChild.value = optionsContainer.innerText;
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

  }

  //checking validity
  (function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.folderForm');
    const create = document.querySelector('.submit');
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }else{
            create.textContent = 'Creating...';
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()

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