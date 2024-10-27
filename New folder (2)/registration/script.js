document.addEventListener('DOMContentLoaded', () => {
    const productsSelect = document.getElementById('products');

    productsSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;

        if (selectedValue === "vitamins") {
            window.location.href = 'vitamins.html';
        }
        // You can add more conditions here for other options if needed
    });

    // Existing cart button logic
    function addToCart(product_id, product_name, quantity, price) {
        const user_id = 1; // Replace with the actual user ID in a real application
        fetch('/add-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, product_id, product_name, quantity, price })
        })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => console.error('Error adding to cart:', error));
    }
    // document.getElementById('about-item').addEventListener('click', function () {
//     window.location.href = '/about';
document.getElementById('vitamins-link').addEventListener('click', function () {
    window.location.href = '/vitamins';
});
document.getElementById('medic-link').addEventListener('click', function () {
    window.location.href = '/medic';
});
document.getElementById('suppliments-link').addEventListener('click', function () {
    window.location.href = '/suppliments';
});
const images = [
    'banner2.jpg',
    'banner3.jpg',
    'banner4.jpg',
    'banner5.jpg',
    'banner6.jpg',

];

let currentIndex = 0; // Track the current image index

function changeImage() {
    currentIndex++; // Move to the next image
    if (currentIndex >= images.length) {
        currentIndex = 0; // Reset to the first image
    }
    document.getElementById('slideshow-image').src = images[currentIndex]; // Change the image source
}

// Change image every 3 seconds (3000 milliseconds)
setInterval(changeImage, 3000);


fetch(`/cart/${user_id}`)
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    const cartItems = document.getElementById('cart-items');
    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <p>${item.product_name} - $${item.price} x ${item.quantity}</p>
        `;
        cartItems.appendChild(itemDiv);
    });
})
.catch(error => console.error('Error fetching cart items:', error));
