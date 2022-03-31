const pdfOpenButton = document.querySelectorAll('[data-modal-target]');
const overlay = document.querySelector('.outlay');

pdfOpenButton.forEach(button=>{
    button.addEventListener('click',()=>{
        const pdf = document.querySelector(button.dataset.modalTarget);
        openPdf(pdf);
    })
})

overlay.addEventListener('click',()=>{
    const pdf = document.querySelectorAll('.pdf.active');
    pdf.forEach(pdf=>{
        closePdf(pdf);
    })
})
function openPdf(pdf){
    if(pdf == null) return;
    pdf.classList.add('active');
    overlay.classList.add('active')
}

function closePdf(pdf){
    if(pdf == null) return;
    pdf.classList.remove('active');
    overlay.classList.remove('active')
}
