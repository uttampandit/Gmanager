//searching mailbox
const searchButton  = document.querySelector('.searchButton');
const searchForm = document.querySelector('.searchForm');
const searchMail = document.querySelector('.searchMail');

 (function () {
  

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.searchForm')
  
  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

    searchButton.addEventListener('click',async (e) => {
    e.preventDefault();
    
    // search.style.display = 'none';
    // loading.style.display = 'block';
    const email = searchForm.email.value;
    if(email){
      if(searchForm.checkValidity()){
        searchButton.innerText = "Getting Data";
    //adding loader
    const loader = document.createElement('span');
   
    loader.classList.add('spinner-grow','spinner-grow-sm');
    loader.role = 'status';
    searchButton.append(loader);
    try{
      const res = await axios.post('/search',{
        searchEmail : email
    })
    if(res.data != 'error'){
      const id = res.data;
      location.assign(`/${id}/${email}/pdf`);
    }else{
      location.assign('/userprofile');
    }
  }catch(e){
    location.assign('/userprofile');
  }
      }else{
        searchForm.classList.add('was-validated')
      }
      
    }else{
      searchForm.classList.add('was-validated')
    }
    
    
})


