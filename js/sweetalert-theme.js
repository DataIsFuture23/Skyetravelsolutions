// Custom SweetAlert2 Theme for Skye Travel Solution
// Uses Glassmorphism and project fonts

const SkyeToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: 'rgba(255, 255, 255, 0.9)', // Glassy white
    color: '#0d3b66',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    customClass: {
        popup: 'glass-toast'
    }
});

const SkyeAlert = Swal.mixin({
    background: 'rgba(255, 255, 255, 0.95)', // Glassy background
    backdrop: `
        rgba(0,0,0,0.4)
        url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
        center left
        no-repeat
    `,
    color: '#333',
    confirmButtonColor: '#0d3b66', // Primary Brand Color
    cancelButtonColor: '#d33',
    padding: '3em',
    customClass: {
        popup: 'glass-popup',
        title: 'outfit-font',
        content: 'outfit-font',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
    },
    showClass: {
        popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
    }
});

// Inject Custom CSS for SweetAlert
const style = document.createElement('style');
style.innerHTML = `
    .glass-popup {
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border-radius: 15px !important;
        font-family: 'Outfit', sans-serif !important;
    }
    
    .glass-toast {
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 8px !important;
        font-family: 'Outfit', sans-serif !important;
    }

    .outfit-font {
        font-family: 'Outfit', sans-serif !important;
    }
`;
document.head.appendChild(style);
