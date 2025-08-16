document.addEventListener('scroll', function() {
    // Delay the fade-in effect by 2 seconds after scrolling starts
    setTimeout(function() {
        document.body.classList.add('fade-in');
    }, 2);
}, { once: true }); // Run this function only once
document.addEventListener('DOMContentLoaded', function() {
    // Dropdown functionality
    const dropdownParent = document.querySelector('.dropdown-parent');
    const dropdown = dropdownParent.querySelector('.dropdown');
    const caretIcon = dropdownParent.querySelector('.caret i');

    dropdownParent.addEventListener('click', function () {
        dropdown.classList.toggle('show-dropdown');

        if (dropdown.classList.contains('show-dropdown')) {
            caretIcon.classList.remove('fa-angle-up');
            caretIcon.classList.add('fa-angle-down');
        } else {
            caretIcon.classList.remove('fa-angle-down');
            caretIcon.classList.add('fa-angle-up');
        }
    });

    // Smooth scrolling for anchor links (optional)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.add-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            alert('Product added to cart!');
        });
    });

    // Newsletter Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }
});

// Smooth dropdown style
const style = document.createElement('style');
style.innerHTML = `
    .dropdown {
        display: none;
        flex-direction: column;
        position: absolute;
        background-color: white;
        box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
        padding: 10px;
        border-radius: 8px;
        margin-top: 5px;
        z-index: 1000;
    }
    .dropdown.show-dropdown {
        display: flex;
    }
    .dropdown li {
        list-style: none;
        margin: 5px 0;
    }
    .dropdown li a {
        color: purple;
        text-decoration: none;
        font-size: 16px;
    }
    .dropdown li a:hover {
        color: darkviolet;
    }
`;
document.head.appendChild(style);
fetch("https://loris-website-production.up.railway.app/")
  .then(res => res.json())
  .then(data => {
     console.log(data);
  });
