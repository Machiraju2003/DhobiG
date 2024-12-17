document.addEventListener('DOMContentLoaded', function() {
    // Dynamically Generate Hour and Minute Options
    function populateTimeOptions() {
        const hourSelect = document.querySelector('select[name="pickupHour"]');
        const minuteSelect = document.querySelector('select[name="pickupMinute"]');

        // Clear any existing options first
        hourSelect.innerHTML = '<option value="">Select Hour</option>';
        minuteSelect.innerHTML = '<option value="">Select Minute</option>';

        // Generate hours (0-23)
        for (let i = 0; i < 24; i++) {
            const option = document.createElement('option');
            option.value = i.toString().padStart(2, '0');
            option.textContent = i.toString().padStart(2, '0');
            hourSelect.appendChild(option);
        }

        // Generate minutes (00, 15, 30, 45)
        const minuteOptions = ['00', '15', '30', '45'];
        minuteOptions.forEach(minute => {
            const option = document.createElement('option');
            option.value = minute;
            option.textContent = minute;
            minuteSelect.appendChild(option);
        });
    }

    // Booking Form Functionality
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const steps = document.querySelectorAll('.booking-step');
        const stepDots = document.querySelectorAll('.step-dot');
        const progressBar = document.querySelector('.progress-bar');
        const pickupOptionLater = document.getElementById('pickupLater');
        const laterPickupDetails = document.getElementById('laterPickupDetails');
        let currentStep = 0;

        // Ensure initial visibility and setup
        function initializeForm() {
            // Show the first step initially
            steps.forEach((step, index) => {
                step.classList.remove('active');
                step.style.display = 'none';
            });
            
            // Show first step
            steps[0].classList.add('active');
            steps[0].style.display = 'block';
            
            // Activate first step dot
            stepDots.forEach(dot => dot.classList.remove('active'));
            stepDots[0].classList.add('active');

            // Populate Time Options
            populateTimeOptions();

            // Hide later pickup details initially
            if (laterPickupDetails) {
                laterPickupDetails.style.display = 'none';
            }
        }

        // Enhanced Validation with Visual Feedback
        function validateStep(step) {
            const inputs = step.querySelectorAll('input[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                // Interactive validation
                input.addEventListener('input', function() {
                    if (this.value.trim()) {
                        this.classList.add('is-valid');
                        this.classList.remove('is-invalid');
                    } else {
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                    }
                });

                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    input.classList.remove('is-valid');
                } else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                }

                // Mobile number validation
                if (input.name === 'mobile') {
                    const mobileRegex = /^[6-9]\d{9}$/;
                    if (!mobileRegex.test(input.value)) {
                        isValid = false;
                        input.classList.add('is-invalid');
                        input.setCustomValidity('Please enter a valid 10-digit mobile number');
                    } else {
                        input.setCustomValidity('');
                    }
                }

                // Email validation
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        input.classList.add('is-invalid');
                        input.setCustomValidity('Please enter a valid email address');
                    } else {
                        input.setCustomValidity('');
                    }
                }
            });

            return isValid;
        }

        // Date Restrictions
        function setupDateRestrictions() {
            const dateInput = document.querySelector('input[name="pickupDate"]');
            if (dateInput) {
                const today = new Date();
                const maxDate = new Date(today);
                maxDate.setMonth(today.getMonth() + 1); // Allow booking up to next month

                // Format date to YYYY-MM-DD
                const formatDate = (date) => {
                    return date.toISOString().split('T')[0];
                };

                dateInput.min = formatDate(today);
                dateInput.max = formatDate(maxDate);
            }
        }

        // Pickup Option Interactions
        if (pickupOptionLater && laterPickupDetails) {
            pickupOptionLater.addEventListener('change', function() {
                laterPickupDetails.style.display = this.checked ? 'block' : 'none';
                
                // Add animation to pickup details
                if (this.checked) {
                    laterPickupDetails.style.animation = 'slideIn 0.5s ease-out';
                } else {
                    laterPickupDetails.style.animation = 'none';
                }
            });
        }

        // Progress Bar Update
        function updateProgressBar() {
            const progress = ((currentStep + 1) / steps.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }

        // Navigation Button Handlers
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', function() {
                if (validateStep(steps[currentStep])) {
                    // Hide current step
                    steps[currentStep].style.display = 'none';
                    stepDots[currentStep].classList.remove('active');
                    
                    // Move to next step
                    currentStep = Math.min(currentStep + 1, steps.length - 1);
                    
                    // Show next step
                    steps[currentStep].style.display = 'block';
                    stepDots[currentStep].classList.add('active');
                    
                    updateProgressBar();
                }
            });
        });

        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', function() {
                // Hide current step
                steps[currentStep].style.display = 'none';
                stepDots[currentStep].classList.remove('active');
                
                // Move to previous step
                currentStep = Math.max(currentStep - 1, 0);
                
                // Show previous step
                steps[currentStep].style.display = 'block';
                stepDots[currentStep].classList.add('active');
                
                updateProgressBar();
            });
        });

        // Form Submission Handler
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Final validation before submission
            if (validateStep(steps[currentStep])) {
                // Collect form data
                const formData = new FormData(bookingForm);
                const bookingDetails = {};

                for (let [key, value] of formData.entries()) {
                    bookingDetails[key] = value;
                }

                // Simulate booking submission with visual feedback
                const submitButton = this.querySelector('button[type="submit"]');
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Booking...';
                submitButton.disabled = true;

                setTimeout(() => {
                    // Create success modal
                    const modal = createBookingConfirmationModal(bookingDetails);
                    document.body.appendChild(modal);

                    // Reset form and UI
                    bookingForm.reset();
                    submitButton.innerHTML = 'Book Service';
                    submitButton.disabled = false;
                    
                    // Reset to first step
                    initializeForm();
                }, 2000);
            }
        });

        function createBookingConfirmationModal(bookingDetails) {
            // Pricing structure in Indian Rupees
            const itemPrices = {
                'shirts': 50,
                'pants': 80,
                'skirts': 70,
                'sweaters': 100,
                'jackets': 120,
                'towels': 30,
                'bedsheets': 60
            };
        
            // Dynamically calculate laundry items from form details
            const laundryItems = Object.keys(itemPrices)
                .map(itemName => {
                    const quantity = parseInt(bookingDetails[itemName] || 0);
                    return quantity > 0 ? {
                        name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
                        quantity: quantity,
                        pricePerItem: itemPrices[itemName],
                        subtotal: quantity * itemPrices[itemName]
                    } : null;
                })
                .filter(item => item !== null);
        
            // Calculate total items and total price
            const totalItems = laundryItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = laundryItems.reduce((sum, item) => sum + item.subtotal, 0);
        
            // Additional service charges
            const additionalServices = [];
            if (bookingDetails.ironingService === 'yes') {
                const ironingCharge = totalItems * 20;
                additionalServices.push({
                    name: 'Ironing Service',
                    price: ironingCharge
                });
                totalPrice += ironingCharge;
            }
        
            if (bookingDetails.expressService === 'yes') {
                const expressCharge = 150;
                additionalServices.push({
                    name: 'Express Service',
                    price: expressCharge
                });
                totalPrice += expressCharge;
            }
        
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-success text-white">
                                <h5 class="modal-title">Booking Confirmed!</h5>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6 text-center">
                                        <i class="fas fa-check-circle text-success" style="font-size: 72px;"></i>
                                        <h4 class="mt-3">Thank You for Booking</h4>
                                        <p>Your laundry service has been scheduled successfully.</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h5 class="mb-4">Booking Details</h5>
                                        <div class="booking-summary">
                                            <p><strong>Pickup Time:</strong> ${bookingDetails.pickupOption === 'earliest' ? 'Next 15 mins' : `${bookingDetails.pickupDate} at ${bookingDetails.pickupHour}:${bookingDetails.pickupMinute}`}</p>
                                            <p><strong>Frequency:</strong> ${bookingDetails.frequency}</p>
                                        </div>
                                        
                                        <h5 class="mt-4 mb-3">Order Summary</h5>
                                        <table class="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Qty</th>
                                                    <th>Price</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${laundryItems.map(item => `
                                                    <tr>
                                                        <td>${item.name}</td>
                                                        <td>${item.quantity}</td>
                                                        <td>₹${item.pricePerItem}</td>
                                                        <td>₹${item.subtotal}</td>
                                                    </tr>
                                                `).join('')}
                                                ${additionalServices.map(service => `
                                                    <tr>
                                                        <td colspan="2">${service.name}</td>
                                                        <td colspan="2">₹${service.price}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                            <tfoot>
                                                <tr class="table-active">
                                                    <td colspan="2"><strong>Total Items</strong></td>
                                                    <td colspan="2"><strong>${totalItems}</strong></td>
                                                </tr>
                                                <tr class="table-active">
                                                    <td colspan="2"><strong>Total Price</strong></td>
                                                    <td colspan="2"><strong>₹${totalPrice.toFixed(2)}</strong></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary close-modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        
            // Close modal event
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });
        
            return modal;
        }
        // Initialize form setup
        initializeForm();
        setupDateRestrictions();
        updateProgressBar();
    }
});



document.addEventListener('DOMContentLoaded', function() {
    const serviceQuantityInputs = document.querySelectorAll('.service-quantity-input');
    const totalItemsSpan = document.getElementById('totalItems');
    const totalPriceSpan = document.getElementById('totalPrice');

    // Service pricing
    const servicePrices = {
        'washFoldQuantity': 30,
        'washIronQuantity': 45,
        'dryCleanQuantity': 30
    };

    // Function to calculate total items and price
    function updateTotalCalculations() {
        let totalItems = 0;
        let totalPrice = 0;

        // Calculate total items and price
        serviceQuantityInputs.forEach(input => {
            const quantity = parseInt(input.value) || 0;
            const serviceName = input.name;
            
            totalItems += quantity;
            totalPrice += quantity * servicePrices[serviceName];
        });

        // Update total items and price displays
        totalItemsSpan.textContent = totalItems;
        totalPriceSpan.textContent = totalPrice;
    }

    // Add event listeners to quantity inputs
    serviceQuantityInputs.forEach(input => {
        input.addEventListener('input', updateTotalCalculations);
    });

    // Initial calculation
    updateTotalCalculations();
});


// toggle icon navbar
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}
// scroll sections
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 100;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            // active navbar links
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
            // active sections for animation on scroll
            sec.classList.add('show-animate');
        }
        // if want to animation that repeats on scroll use this
        else {
            sec.classList.remove('show-animate');
        }
    });

    // sticky navbar
    let header = document.querySelector('header');

    header.classList.toggle('sticky', window.scrollY > 100);

    // remove toggle icon and navbar when click navbar links (scroll)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');

    // animation footer on scroll
    let footer = document.querySelector('footer');

    footer.classList.toggle('show-animate', this.innerHeight + this.scrollY >= document.scrollingElement.scrollHeight);
}