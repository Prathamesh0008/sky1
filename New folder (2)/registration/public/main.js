document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id'); // Get product ID from data attribute
        const productName = this.previousElementSibling.previousElementSibling.value; // Get product name
        const productPrice = this.previousElementSibling.value; // Get product price
        const quantity = this.previousElementSibling.value; // Get quantity from input

        const data = {
            product_id: productId,
            product_name: productName,
            price: productPrice,
            quantity: quantity
        };

        // Send the data to the backend
        fetch('/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Optionally update the UI or notify the user
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});

const quantityInput = document.getElementById('.quantity-1');
const increaseButton = document.querySelector('.increase-quantity');
const decreaseButton = document.querySelector('.decrease-quantity');

// Increase quantity
increaseButton.addEventListener('click', () => {
    let currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1; // Increment by 1
});

// Decrease quantity
decreaseButton.addEventListener('click', () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1; // Decrement by 1, but not below 1
    }
});