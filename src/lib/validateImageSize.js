import Swal from 'sweetalert2';

export const validateImageSize = (file, maxSizeInKb = 10240) => {
    if (!file) return false;
    
    const fileSizeInKb = file.size / 1024;
    if (fileSizeInKb > maxSizeInKb) {
        Swal.fire({
            icon: 'error',
            title: 'File Too Large',
            text: `Image size must be less than ${maxSizeInKb}KB. Current size is ${Math.round(fileSizeInKb)}KB.`
        });
        return false;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Format',
            text: 'Only JPG, PNG, and WEBP formats are allowed.'
        });
        return false;
    }
    
    return true;
};
