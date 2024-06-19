document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let productName = document.getElementById('productName').value;
    let productPrice = document.getElementById('productPrice').value;
    let productDiscountPrice = document.getElementById('productDiscountPrice').value;
    let productImage = document.getElementById('productImage').files[0];

    let reader = new FileReader();
    reader.onload = function (e) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.push({
            name: productName,
            price: productPrice,
            discountPrice: productDiscountPrice,
            image: e.target.result
        });
        localStorage.setItem('products', JSON.stringify(products));
        alert('Product uploaded successfully!');
        document.getElementById('uploadForm').reset();
    };
    reader.readAsDataURL(productImage);
});
