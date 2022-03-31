var datapdf = null;
const main = document.querySelector('.main-screen');
const select = document.querySelector('#sort');
const pdf = document.querySelectorAll('.pdf');
const row = document.querySelector('.pdfRow');
const filter = document.querySelector('.filter');
const fromdate = document.querySelector('.fromdate');
const todate = document.querySelector('.todate');
const reset = document.querySelector('.reset');
const to = document.querySelector('.to');
reset.disabled = true;
if(document.querySelector('.filename-length')){
const length = document.querySelector('.filename-length').textContent;
  
    const button = [];
    const messageid = [];
    const attachmentid = [];
    const filename = [];
    const dates = [];
    const datesvalue = [];
    let email=  null;
function runme(){
    
    for(let i = 0;i<length;i++){
         button[i]=document.querySelector(`#button${i}`)
        messageid[i]=document.querySelector(`#messageid${i}`).textContent;
        attachmentid[i]=document.querySelector(`#attachmentid${i}`).textContent;
        filename[i] = document.querySelector(`#filename${i}`).textContent;
        dates[i] = document.querySelector(`#date${i}`);
        datesvalue[i] = new Date(dates[i].textContent);
       
        if(button[i].clicked != true);
        button[i].clicked = false;
         button[i].addEventListener('click',async ()=>{
             const text = button[i].textContent;
             button[i].textContent = "Opening the pdf..."; 
             if(!button[i].clicked){
            const res = await axios.post('/finddata',{
                attachmentid : attachmentid[i],
                messageid : messageid[i],
                filename : filename[i], 
                date : datesvalue[i]
            })
            button[i].textContent = text;
            email = res.data;
            if(res.data){
                button[i].clicked = true;
                // location.href=`/web/${res.data}/${filename[i]}`;
                window.open(`/pdfs/${res.data}/${filename[i]}`, '_blank')
            }
    
        }else{
            button[i].textContent = text;
            window.open(`/pdfs/${email}/${filename[i]}`, '_blank')
        }
         })
      
    }
    }
    runme();
    const search = document.querySelector('#search');
   

    search.addEventListener('keyup',(e)=>{
      let searchvalue = search.value.toUpperCase();
        filename.forEach((file,index) =>{
            if(file.toUpperCase().indexOf(searchvalue) != -1){
               
                button[index].parentElement.style.display = 'block';
            }else{
               
                button[index].parentElement.style.display = 'none';
            }
        })
    })
select.addEventListener('change',(e)=>{

    if(select.value === 'oldestFirst'){
        for(let i = 0; i < length; i++){
                
                row.append(pdf[length-i-1]);
                // document.body.lastChild.before(pdf[length-i-1]);
            
            
        }
        
    }else{
        for(let i = 0; i < length; i++){
            
                row.append(pdf[i])
            
            
            
        }
    }
})

//filter
filter.addEventListener('click',()=>{
    let fromDate = new Date(fromdate.value);
    
    let toDate = new Date(todate.value);
    if(fromDate!='Invalid Date' && toDate!='Invalid Date'){
        dates.forEach((date,i)=>{
            const datevalue = new Date(date.textContent);
            if(fromDate.getTime()<=datevalue.getTime() && toDate.getTime()>=datevalue.getTime()){
                reset.disabled = false;
            }else{
                date.parentElement.style.display = 'none';
                reset.disabled = false;
            }
        })
    }else{
     
     
      const error = document.createElement('div');
      error.classList.add('error-date');
      error.textContent = 'Please select date correctly';
      todate.parentElement.parentElement.parentElement.insertBefore(error,todate.parentElement.parentElement.nextElementSibling);
      setTimeout(()=>{
          todate.parentElement.parentElement.parentElement.removeChild(error);
      },3000)
    }
})

reset.addEventListener('click',()=>{
    reset.disabled = true;
    dates.forEach(date => {
        fromdate.value = '';
        todate.value = '';
        date.parentElement.style.display = 'block';
    })
})
}