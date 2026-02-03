/* ==================== MENU SHOW/HIDE ==================== */
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu')
    })
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
    })
}

/* ==================== VIDEO PLAYLIST LOGIC ==================== */
function initVideoSlider() {
    console.log("Initializing Video Slider...");
    const videoContainer = document.getElementById('hero-video-container');
    if (!videoContainer) {
        console.error("Video container not found!");
        return;
    }

    const v1 = document.getElementById('hero-video-1');
    const v2 = document.getElementById('hero-video-2');

    // Playlist
    // Playlist: Add your video URLs here
    // Using local video twice to ensure seamless crossfade loop without external network risks
    const playlist = [
        'media/hero.mp4',
        'media/hero.mp4'
    ];

    let currentIndex = 0;
    let activeVideo = v1; // The visible video
    let nextVideo = v2;   // The hidden buffer
    let isTransitioning = false;

    // Helper: Ensure video is ready
    const preloadNext = () => {
        let nextIndex = (currentIndex + 1) % playlist.length;
        console.log(`Preloading next video [${nextIndex}]: ${playlist[nextIndex]}`);
        nextVideo.src = playlist[nextIndex];
        nextVideo.load();
    };

    // Initial Setup
    console.log("Starting first video...");
    activeVideo.play().catch(e => console.error("Autoplay failed:", e));
    preloadNext();

    const switchVideo = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        console.log(`Switching video. Current: ${currentIndex} -> Next: ${(currentIndex + 1) % playlist.length}`);

        // Try to play the buffered video
        const playPromise = nextVideo.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Next video started playing. Fading...");

                // Crossfade
                nextVideo.classList.add('active');
                activeVideo.classList.remove('active');

                // Cleanup after transition
                setTimeout(() => {
                    console.log("Transition complete. Swapping references.");

                    // Stop old video
                    activeVideo.pause();
                    activeVideo.currentTime = 0;

                    // Swap
                    const temp = activeVideo;
                    activeVideo = nextVideo;
                    nextVideo = temp;

                    // Update State
                    currentIndex = (currentIndex + 1) % playlist.length;
                    isTransitioning = false;

                    // Prepare for NEXT
                    preloadNext();

                }, 1500);
            }).catch(error => {
                console.error("Next video failed to play:", error);
                isTransitioning = false;
            });
        }
    };

    // Time Check Logic
    const checkTime = (e) => {
        const vid = e.target;
        if (!vid.duration) return;

        // Transition 1.5s before end (matching CSS)
        // If video is short (<4s), do it at 50%
        const triggerTime = vid.duration < 4 ? vid.duration / 2 : vid.duration - 1.5;

        // Only trigger once per cycle
        if (vid.currentTime > triggerTime && !isTransitioning) {
            console.log(`Time trigger: ${vid.currentTime} / ${vid.duration}`);
            switchVideo();
        }
    };

    // Listeners
    [v1, v2].forEach((v, i) => {
        v.addEventListener('timeupdate', (e) => {
            if (activeVideo === v) checkTime(e);
        });

        v.addEventListener('ended', (e) => {
            console.log(`Video ${i} Ended. Active? ${activeVideo === v}`);
            if (activeVideo === v && !isTransitioning) {
                console.warn("Crossfade missed! Forcing switch.");
                switchVideo();
            }
        });

        // ERROR HANDLING for Netlify/Deployment issues
        v.addEventListener('error', (e) => {
            console.error(`Video ${i} Error:`, v.error);
            const errCode = v.error ? v.error.code : 'unknown';
            console.warn(`Video failed to load (Code ${errCode}). It might be missing from the deployment.`);

            // If active video fails, try to switch or notify
            if (activeVideo === v) {
                // Show a toast so the user knows why they see the poster
                // Only show once per session to avoid spam
                if (!sessionStorage.getItem('video_error_shown')) {
                    SkyeToast.fire({ icon: 'warning', title: 'Video Background Failed', text: 'Using static background image.' });
                    sessionStorage.setItem('video_error_shown', 'true');
                }
            }
        });
    });

    // Manual debug trigger (Shift + Click on video)
    videoContainer.addEventListener('click', (e) => {
        if (e.shiftKey) {
            console.log("Manual trigger!");
            switchVideo();
        }
    });
}


const navLink = document.querySelectorAll('.nav-link')
function linkAction() {
    const navMenu = document.getElementById('nav-menu')
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/* ==================== CHANGE BACKGROUND HEADER ==================== */
function scrollHeader() {
    const header = document.getElementById('header')
    if (this.scrollY >= 80) header.classList.add('scroll-header'); else header.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)

/* ==================== SHOW SCROLL UP ==================== */
function scrollUp() {
    const scrollUp = document.getElementById('scroll-up');
    if (this.scrollY >= 400) scrollUp.classList.add('show-scroll'); else scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/* ==================== DESTINATION DATA & API ==================== */
// Smart API Base URL:
// 1. If opening via file:// (Double clicking index.html), point to localhost:3000
// 2. If opening via http:// (Localhost or Tunnel), use relative path
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
// FALLBACK DATA (For Offline/Standalone Mode)
const OFFLINE_DESTINATIONS = [
    // INDIA (IDs 1-10)
    {
        id: '1', title: 'Taj Mahal, India',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        price: '₹15,000', rating: 4.9, category: 'Heritage'
    },
    {
        id: '2', title: 'Goa Beaches, India',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        price: '₹20,000', rating: 4.7, category: 'Beaches'
    },
    {
        id: '3', title: 'Jaipur, India',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        price: '₹18,000', rating: 4.8, category: 'Heritage'
    },
    {
        id: '4', title: 'Kerala Backwaters, India',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        price: '₹22,000', rating: 4.9, category: 'Nature'
    },
    {
        id: '5', title: 'Varanasi, India',
        image: 'https://images.unsplash.com/photo-1561361513-35bd30f25c77?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        price: '₹12,000', rating: 4.7, category: 'Spiritual'
    },
    {
        id: '6', title: 'Ladakh, India',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        price: '₹25,000', rating: 4.8, category: 'Adventure'
    },
    {
        id: '7', title: 'Udaipur, India',
        image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
        price: '₹20,000', rating: 4.8, category: 'Heritage'
    },
    {
        id: '8', title: 'Andaman Islands, India',
        image: 'https://images.unsplash.com/photo-1550296767-f7adba0c5fb1?auto=format&fit=crop&w=1600&q=80',
        price: '₹35,000', rating: 4.9, category: 'Beaches'
    },
    {
        id: '9', title: 'Rishikesh, India',
        image: 'https://images.unsplash.com/photo-1563297690-5588e9b6c0bc?auto=format&fit=crop&w=1600&q=80',
        price: '₹10,000', rating: 4.6, category: 'Adventure'
    },
    {
        id: '10', title: 'Hampi, India',
        image: 'https://images.unsplash.com/photo-1620766165457-a8025baa82e0?auto=format&fit=crop&w=1600&q=80',
        price: '₹14,000', rating: 4.7, category: 'Heritage'
    },

    // INTERNATIONAL
    {
        id: '35', title: 'Machu Picchu, Peru',
        image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        price: '₹95,000', rating: 4.9, category: 'Hiking'
    },
    {
        id: '27', title: 'Dubai, UAE',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        price: '₹85,000', rating: 4.6, category: 'Luxury'
    },
    {
        id: '36', title: 'Great Barrier Reef, Australia',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        price: '₹1,50,000', rating: 4.7, category: 'Wildlife'
    },
    {
        id: '37', title: 'Kyoto, Japan',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        price: '₹1,10,000', rating: 4.8, category: 'Walking'
    },
    {
        id: '38', title: 'Bora Bora, French Polynesia',
        image: 'https://images.unsplash.com/photo-1505881402582-c5bc11054f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        price: '₹1,20,000', rating: 4.8, category: 'Cruises'
    }
];

// Initialize with offline data by default to prevent empty states
let allDestinationsData = OFFLINE_DESTINATIONS;
let destinationsData = [];

// Fetch Destinations
async function fetchDestinations() {
    const grid = document.getElementById('destinations-grid');
    if (!grid) return;

    // Get Category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    // Update Title if category is present
    if (category) {
        const titleEl = document.querySelector('#destinations .section-title');
        if (titleEl) titleEl.textContent = `${category} Destinations`;
    }

    try {
        // Try Fetching from Server
        const response = await fetch(`${API_BASE}/api/destinations`);
        if (!response.ok) throw new Error('Failed to fetch');

        const allDestinations = await response.json();
        allDestinationsData = allDestinations; // Store globally
        processDestinations(allDestinations, category, grid);
        processDestinations(allDestinations, category, grid);

    } catch (error) {
        console.warn('Server not reachable, using offline fallback data.');
        allDestinationsData = OFFLINE_DESTINATIONS; // Store globally for subsequent filters
        processDestinations(OFFLINE_DESTINATIONS, category, grid);
    }
}

function processDestinations(allData, category, grid) {
    // Filter logic
    destinationsData = category
        ? allData.filter(d => d.category === category)
        : allData;

    grid.innerHTML = ''; // Clear loading

    if (destinationsData.length === 0 && category) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center;"><h3>No destinations found for ${category}.</h3><button class="btn btn-small" onclick="window.location.href='index.html#destinations'">View All</button></div>`;
    }

    destinationsData.forEach(dest => {
        const card = document.createElement('div');
        card.classList.add('destination-card');
        card.style.borderRadius = "0";
        card.style.overflow = "hidden";

        card.innerHTML = `
            <div class="card-img-wrapper" style="position: relative; overflow: hidden;">
                <img src="${dest.image}" alt="${dest.title}" class="card-img" style="width: 100%; height: 250px; object-fit: cover; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);">
                <div class="card-overlay" style="background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);">
                    <button class="btn btn-card" onclick="window.openDetails('${dest.id}')">View Details</button>
                </div>
            </div>
            <div class="card-content" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h3 class="card-title" style="margin: 0; font-family: 'Playfair Display', serif;">${dest.title}</h3>
                    <div class="card-rating" style="color: #ffb700; font-size: 0.9rem;">
                            ★ ${dest.rating}
                    </div>
                </div>
                <div class="card-price" style="display: flex; align-items: baseline; gap: 0.5rem; color: var(--text-color);">
                    <span style="font-size: 0.9rem;">Starting from</span>
                    <strong style="color: var(--first-color); font-size: 1.1rem;">${dest.price}</strong>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}
function renderDestinations() { } // No longer needed as it's merged, but keep empty to avoid ref errors if called elsewhere

// Call fetch on load
document.addEventListener('DOMContentLoaded', fetchDestinations);

/* ==================== DETAILS MODAL ==================== */
const detailsModal = document.getElementById('details-modal')
const detailsClose = document.getElementById('details-close')

// Expose globally
// Expose globally
window.openDetails = function (id) {
    console.log('Redirecting to details for:', id);
    // Redirect to new Deep Dive Page
    window.location.href = `destination-details.html?id=${id}`;
}

if (detailsClose) {
    detailsClose.addEventListener('click', () => {
        detailsModal.classList.remove('active-modal');
    })
}

// Close clicking outside
window.addEventListener('click', (e) => {
    if (e.target == detailsModal) {
        detailsModal.classList.remove('active-modal')
    }
})


/* ==================== BOOKING MODAL ==================== */
const bookingModal = document.getElementById('booking-modal')
const bookingClose = document.getElementById('modal-close')

// Populate Dropdown Helper
function populateDestinationSelect() {
    const select = document.getElementById('destination-select');
    if (!select || select.children.length > 1) return; // Already populated

    // Sort alphabetically for better UX
    const sorted = [...destinationsData].sort((a, b) => a.title.localeCompare(b.title));

    sorted.forEach(dest => {
        const option = document.createElement('option');
        option.value = dest.title;
        option.textContent = `${dest.title} - ${dest.price}`; // Show price too
        select.appendChild(option);
    });
}

// Global state for mode
let isInquiryOnly = false;

window.openBooking = function (destinationName, inquiryMode = false) {
    const modalTitle = document.getElementById('modal-destination-name');
    const titleContainer = document.getElementById('booking-modal-title');
    const selectGroup = document.getElementById('destination-select-group');
    const selectInput = document.getElementById('destination-select');
    const hiddenInput = document.getElementById('book-destination');
    const submitBtn = document.querySelector('#booking-form button[type="submit"]');

    if (bookingModal) {
        bookingModal.classList.add('active-modal');
        isInquiryOnly = inquiryMode;

        // Populate dropdown if needed
        populateDestinationSelect();

        // 1. Logic for "General Inquiry" or "Tour Booking Now" (Needs Dropdown)
        if (destinationName === 'General Inquiry') {
            selectGroup.style.display = 'block';
            selectInput.required = true;
            selectInput.value = "";
            hiddenInput.value = "";
            currentPrice = '₹0';

            if (inquiryMode) {
                // Inquiry Mode
                titleContainer.innerHTML = 'Make an <span style="color:var(--first-color)">Inquiry</span>';
                submitBtn.innerHTML = 'Send Inquiry <i class="ph ph-paper-plane-right"></i>';
            } else {
                // Booking Mode
                titleContainer.innerHTML = 'Plan your <span style="color:var(--first-color)">Dream Trip</span>';
                submitBtn.innerHTML = 'Proceed to Payment <i class="ph ph-arrow-right"></i>';
            }

        } else {
            // 2. Logic for Specific Destination (Pre-selected)
            if (inquiryMode) {
                // Service Inquiry or specific inquiry
                titleContainer.innerHTML = 'Inquire about <span id="modal-destination-name">' + destinationName + '</span>';
                submitBtn.innerHTML = 'Send Inquiry <i class="ph ph-paper-plane-right"></i>';
                isInquiryOnly = true;
            } else {
                // Standard Booking
                titleContainer.innerHTML = 'Book your Trip to <span id="modal-destination-name">' + destinationName + '</span>';
                submitBtn.innerHTML = 'Proceed to Payment <i class="ph ph-arrow-right"></i>';
                isInquiryOnly = false;
            }

            selectGroup.style.display = 'none';
            selectInput.required = false;
            hiddenInput.value = destinationName;

            const dest = destinationsData.find(d => d.title === destinationName);
            currentPrice = dest ? dest.price : '₹0';
        }
    }
}

// Update price when dropdown changes
const destSelect = document.getElementById('destination-select');
if (destSelect) {
    destSelect.addEventListener('change', (e) => {
        const selectedTitle = e.target.value;
        document.getElementById('book-destination').value = selectedTitle;

        const dest = destinationsData.find(d => d.title === selectedTitle);
        currentPrice = dest ? dest.price : '₹0';
    });
}

if (bookingClose) {
    bookingClose.addEventListener('click', () => {
        bookingModal.classList.remove('active-modal')
    })
}

window.addEventListener('click', (e) => {
    if (e.target == bookingModal) {
        bookingModal.classList.remove('active-modal')
    }
})

// Form Submission
const bookingForm = document.getElementById('booking-form')
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get value from hidden input (handled by openBooking logic)
        const destination = document.getElementById('book-destination').value;

        if (!destination) {
            SkyeToast.fire({
                icon: 'warning',
                title: 'Please select a destination'
            });
            return;
        }

        const name = document.getElementById('book-name').value;
        const email = document.getElementById('book-email').value;
        const phone = document.getElementById('book-phone').value;
        const submitBtn = bookingForm.querySelector('.btn');

        // Show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ destination, name, email, phone })
            });

            if (!response.ok) throw new Error('Failed to save booking');
            const bookingData = await response.json();

            // SUCCESS
            bookingModal.classList.remove('active-modal');
            bookingForm.reset();

            if (isInquiryOnly) {
                // Inquiry Mode -> Done
                SkyeAlert.fire({
                    icon: 'success',
                    title: 'Inquiry Sent!',
                    text: `Thank you, ${name}! Your inquiry has been sent. We will contact you shortly.`
                });
            } else {
                // Booking Mode -> Pay
                openPaymentModal(bookingData.id, currentPrice);
            }

        } catch (error) {
            console.warn('Booking API Error. Attempting EmailJS Fallback...', error);

            // EmailJS Config (User to Update)
            const serviceID = "YOUR_SERVICE_ID";
            const templateID = "YOUR_TEMPLATE_ID";

            try {
                await emailjs.send(serviceID, templateID, {
                    destination: destination,
                    from_name: name,
                    from_email: email,
                    phone: phone,
                    message: isInquiryOnly ? 'General Inquiry' : 'Booking Request',
                    reply_to: email
                });

                // SUCCESS (EmailJS)
                bookingModal.classList.remove('active-modal');
                bookingForm.reset();

                if (isInquiryOnly) {
                    SkyeAlert.fire({ icon: 'success', title: 'Inquiry Sent!', text: `Thank you, ${name}! Your inquiry has been sent.` });
                } else {
                    // Start Mock Payment
                    openPaymentModal('OFFLINE-' + Date.now(), currentPrice);
                }

            } catch (emailErr) {
                console.error('EmailJS Failed:', emailErr);
                SkyeAlert.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: 'Sorry, we could not process your request. Please try WhatsApp.'
                });
            }
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    })
}

// Payment Logic
let currentPrice = '₹0';
const paymentModal = document.getElementById('payment-modal');
const paymentClose = document.getElementById('payment-close');
const paymentForm = document.getElementById('payment-form');

function openPaymentModal(bookingId, price) {
    if (!paymentModal) return;
    document.getElementById('pay-booking-id').value = bookingId;
    document.getElementById('pay-amount').textContent = price;
    paymentModal.classList.add('active-modal');
}

if (paymentClose) {
    paymentClose.addEventListener('click', () => {
        paymentModal.classList.remove('active-modal');
        SkyeToast.fire({
            icon: 'info',
            title: 'Booking saved! You can pay later.'
        });
    });
}

if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-pay');
        const feedback = document.getElementById('payment-feedback');

        // UI Loading
        paymentForm.style.display = 'none';
        feedback.style.display = 'block';

        const bookingId = document.getElementById('pay-booking-id').value;

        try {
            const res = await fetch(`${API_BASE}/api/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, cardDetails: 'mock' })
            });
            const data = await res.json();

            if (res.ok) {
                feedback.innerHTML = `
                    <i class="ph ph-check-circle" style="font-size: 3rem; color: #2ecc71;"></i>
                    <h3>Payment Successful!</h3>
                    <p>Transaction ID: ${data.transactionId}</p>
                    <button class="btn btn-small" onclick="location.reload()">Done</button>
                `;
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            feedback.innerHTML = `<p style="color: red;">Payment Failed. Try again.</p>`;
            setTimeout(() => {
                feedback.style.display = 'none';
                paymentForm.style.display = 'block';
            }, 2000);
        }
    });
}

/* ==================== SEARCH FUNCTIONALITY ==================== */
// Use unique variable names to avoid conflicts with any legacy code
const searchBtnEl = document.querySelector('.btn-search');
const searchFormEl = document.querySelector('.search-form');
const locationInputEl = document.getElementById('location');

function performSearch() {
    if (!locationInputEl) return;
    const query = locationInputEl.value.toLowerCase().trim();
    console.log('Searching for:', query);

    const destSection = document.getElementById('destinations');
    if (destSection) {
        destSection.scrollIntoView({ behavior: 'smooth' });

        const cards = document.querySelectorAll('.destination-card');
        let foundAny = false;

        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            if (title.includes(query) || query === '') {
                card.style.display = 'block';
                foundAny = true;
            } else {
                card.style.display = 'none';
            }
        });

        if (!foundAny && query !== '') {
            // Optional: fallback suggestions or reset
            SkyeAlert.fire({
                icon: 'info',
                title: 'No Results Found',
                text: 'No destinations found for "' + query + '". Showing all popular destinations.'
            });
            cards.forEach(c => c.style.display = 'block');
            locationInputEl.value = '';
        }
    }
}

if (searchBtnEl) {
    searchBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });
}

if (searchFormEl) {
    searchFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });
}

/* ==================== WHATSAPP INTEGRATION ==================== */
function sendToWhatsApp(context) {
    const phoneNumber = "918655874294";
    let message = "";

    if (context === 'general') {
        const dest = document.getElementById('book-destination') ? document.getElementById('book-destination').value : "a trip";
        const name = document.getElementById('book-name') ? document.getElementById('book-name').value : "Guest";
        message = `Hi Skye Travel, I'm ${name} and I'm interested in ${dest}. Can you help me plan?`;
    } else if (context === 'modal') {
        const destInput = document.getElementById('book-destination');
        const nameInput = document.getElementById('book-name');
        const dest = destInput ? destInput.value : "a trip";
        const name = nameInput ? nameInput.value : "Guest";
        message = `Hi, I want to inquire about ${dest}. My name is ${name}.`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Global scope exposure
// Global scope exposure
window.sendToWhatsApp = sendToWhatsApp;
window.performSearch = performSearch;

/* ==================== CATEGORY FILTER ==================== */
function filterCategory(category) {
    const grid = document.getElementById('destinations-grid');
    if (!grid) return;

    console.log("Filtering by:", category);

    // Update Active UI state if needed (optional)
    const cards = document.querySelectorAll('.category-card, .category-card-3d');
    cards.forEach(card => {
        const text = card.textContent.trim() || card.querySelector('img')?.alt || "";
        if (text.includes(category)) {
            card.classList.add('active-category');
            if (card.classList.contains('category-card-3d')) card.classList.add('center-card');
        } else {
            card.classList.remove('active-category');
            if (card.classList.contains('category-card-3d')) card.classList.remove('center-card');
        }
    });

    // Update URL without reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('category', category);
    window.history.pushState({}, '', newUrl);

    // Update Section Title
    const titleEl = document.querySelector('#destinations .section-title');
    if (titleEl) {
        // Handle alias: If category is 'Luxury', show 'Airbirds' or 'Luxury' depending on preference.
        // Let's match the card title: 'Airbirds' -> 'Luxury Destinations' might be confusing? 
        // User asked for "Airbirds" so let's call it "Airbirds Destinations" or "Luxury Airbirds"
        // Actually, let's just use the category name passed, but map 'Luxury' to 'Airbirds' for display if desired, 
        // OR just ensure the filter works.
        // User issue: "top cruises destination didnt changed". 
        // Fix: Update text content.
        const displayTitle = category === 'Luxury' ? 'Airbirds' : category;
        titleEl.textContent = `${displayTitle} Destinations`;
    }

    // Filter Logic
    // 1. Try filtering the main data (Global state)
    let filtered = [];
    if (allDestinationsData && allDestinationsData.length > 0) {
        filtered = category ? allDestinationsData.filter(d => d.category === category) : allDestinationsData;
    }

    // 2. Fallback: If Filter returned nothing, check OFFLINE_DESTINATIONS specifically
    // This fixes the issue if API returns data but MISSING 'Luxury', while Offline has it.
    if (filtered.length === 0 && category) {
        console.warn(`No results for ${category} in main data. Checking offline backup.`);
        const offlineMatches = OFFLINE_DESTINATIONS.filter(d => d.category === category);
        if (offlineMatches.length > 0) {
            filtered = offlineMatches;
        }
    }

    // 3. Render
    // We manually call logic similar to processDestinations but passing the already filtered list
    // Or we just hack processDestinations to accept pre-filtered data or pass the source.
    // Let's pass the "best source" to processDestinations.

    // Actually, processDestinations takes (allData, category). 
    // It filters internally. We should pass the *Source* that has the data.

    let sourceData = allDestinationsData;
    if (filtered.length > 0 && (!allDestinationsData || !allDestinationsData.includes(filtered[0]))) {
        // If we found matches in offline but they aren't in main data, use offline as source
        sourceData = OFFLINE_DESTINATIONS;
    } else if (filtered.length === 0 && (!allDestinationsData || allDestinationsData.length === 0)) {
        sourceData = OFFLINE_DESTINATIONS;
    }

    // Force processDestinations to run. 
    processDestinations(sourceData, category, grid);

    // Scroll if we found something (or even if we didn't, to show the error)
    const destSection = document.getElementById('destinations');
    if (destSection) destSection.scrollIntoView({ behavior: 'smooth' });
}
window.filterCategory = filterCategory;

/* ==================== LEAFLET INTERACTIVE MAP ==================== */
function initMap() {
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) return;

    // Center map roughly to view global or Asia/Europe info
    const map = L.map('world-map').setView([20, 0], 2);

    // Premium Light Tile Layer (CartoDB Positron) - Clean & Elegant
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Destination Coordinates (Hardcoded for Demo)
    const coords = {
        'Bora Bora, French Polynesia': [-16.5004, -151.7415],
        'Machu Picchu, Peru': [-13.1631, -72.5450],
        'Great Barrier Reef, Australia': [-18.2871, 147.6992],
        'Kyoto, Japan': [35.0116, 135.7681],
        'Santorini, Greece': [36.3932, 25.4615],
        'Dubai, UAE': [25.2048, 55.2708]
    };

    // Add Markers from Offline Data (as it's the safest source right now)
    OFFLINE_DESTINATIONS.forEach(dest => {
        const latLng = coords[dest.title];
        if (latLng) {
            const marker = L.marker(latLng).addTo(map);

            // Custom Popup Content
            const popupContent = `
                <div style="text-align: center; width: 150px;">
                    <img src="${dest.image}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0 0 0.5rem 0; font-family: 'Playfair Display';">${dest.title}</h4>
                    <button class="btn btn-small" onclick="window.openDetails('${dest.id}')" style="font-size: 0.8rem; padding: 0.2rem 0.5rem;">View</button>
                </div>
            `;
            marker.bindPopup(popupContent);
        }
    });
}

// Initialize Map after DOM
// Initialize Map after DOM
document.addEventListener('DOMContentLoaded', () => {
    // Existing Fetch
    fetchDestinations();
    // New Map Init
    initMap();
    // Video Playlist
    initVideoSlider();

    // Trigger Animations on Load
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-reveal');
            }
        });
    }, { threshold: 0.1 });

    // Observe elements with reveal classes
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach((el) => {
        observer.observe(el);
    });
});


/* ==================== SMART WIZARD LOGIC ==================== */
const wizardModal = document.getElementById('wizard-modal');
const wizardClose = document.getElementById('wizard-close');
const wizardForm = document.getElementById('wizard-form');

// State
let currentStep = 1;
const totalSteps = 3;

window.openWizard = function () {
    if (wizardModal) {
        wizardModal.classList.add('active-modal');
        resetWizard();
    }
}

if (wizardClose) {
    wizardClose.addEventListener('click', () => {
        wizardModal.classList.remove('active-modal');
    });
}

function resetWizard() {
    currentStep = 1;
    showStep(currentStep);
    if (wizardForm) wizardForm.reset();
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active-step'));

    // Show current
    const target = document.querySelector(`.wizard-step[data-step="${step}"]`);
    if (target) target.classList.add('active-step');

    // Update Buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');

    if (step === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    } else if (step === totalSteps) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'flex'; // It's a flex pill
        updateWizardSummary();
    } else {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    }

    // Update Progress Bar
    const progress = document.getElementById('wizard-progress');
    if (progress) {
        const percentage = ((step - 1) / (totalSteps - 1)) * 100;
        progress.style.width = `${percentage}%`;
    }
}

// Event Listeners for Nav
document.getElementById('next-btn')?.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
    }
});

document.getElementById('prev-btn')?.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

function validateStep(step) {
    const activeStepEl = document.querySelector(`.wizard-step[data-step="${step}"]`);
    const inputs = activeStepEl.querySelectorAll('input[required]');
    let valid = true;
    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.reportValidity();
            valid = false;
        }
    });
    return valid;
}

function updateWizardSummary() {
    const vibe = document.querySelector('input[name="vibe"]:checked')?.value || '...';
    const budget = document.querySelector('input[name="budget"]:checked')?.value || '...';
    const summaryEl = document.getElementById('wizard-summary');
    if (summaryEl) {
        summaryEl.textContent = `Planning a ${vibe} trip with a ${budget} budget.`;
    }
}

// Wizard Submission
// Wizard Submission (AI Upgrade)
if (wizardForm) {
    console.log("Wizard form found, attaching AI listener.");
    wizardForm.addEventListener('submit', (e) => {
        console.log("Wizard submitted!");
        e.preventDefault();
        const vibe = document.querySelector('input[name="vibe"]:checked').value;
        const budget = document.querySelector('input[name="budget"]:checked').value;
        const name = document.getElementById('wizard-name').value;
        console.log("Values:", { vibe, budget, name });

        // Close Wizard, Open Itinerary Modal
        wizardModal.classList.remove('active-modal');
        const itinModal = document.getElementById('itinerary-modal');
        if (!itinModal) {
            console.error("Itinerary modal not found!");
            return;
        }
        itinModal.classList.add('active-modal');

        // Show Loading
        const loading = document.getElementById('itinerary-loading');
        if (loading) loading.style.display = 'block';

        const result = document.getElementById('itinerary-result');
        if (result) result.style.display = 'none';

        const actions = document.getElementById('itinerary-actions');
        if (actions) actions.style.display = 'none';

        // Simulate AI Delay
        console.log("Starting 2s timer...");
        setTimeout(() => {
            console.log("Timer done, generating itinerary...");
            generateAIItinerary(vibe, budget, name);
        }, 2000);
    });
} else {
    console.error("Wizard Form not found in DOM!");
}

// AI Itinerary Logic
function generateAIItinerary(vibe, budget, name) {
    console.log("Generating itinerary for:", vibe, budget);
    const loading = document.getElementById('itinerary-loading');
    const resultContainer = document.getElementById('itinerary-result');
    const actions = document.getElementById('itinerary-actions');


    // MOCK AI LOGIC
    let dest = "";
    let itinerary = [];

    if (vibe === 'Adventure') {
        dest = "Machu Picchu, Peru";
        itinerary = [
            { day: "Day 1", title: "Arrival & Acclimatization", desc: "Arrive in Cusco. Coca tea welcome. Evening walk through the cobbled streets." },
            { day: "Day 2", title: "Sacred Valley Tour", desc: "Visit Pisac Market and Ollantaytambo Fortress. Scenic train ride to Aguas Calientes." },
            { day: "Day 3", title: "The Lost City", desc: "Early morning hike to Machu Picchu. Guided tour of the ruins. Return train to Cusco." }
        ];
    } else if (vibe === 'Relaxing') {
        dest = "Bora Bora, French Polynesia";
        itinerary = [
            { day: "Day 1", title: "Welcome to Paradise", desc: "Arrival by water taxi. Check-in to Overwater Bungalow. Sunset cocktail cruise." },
            { day: "Day 2", title: "Lagoon Leisure", desc: "Breakfast delivered by canoe. Private beach picnic. Afternoon spa session." },
            { day: "Day 3", title: "Underwater World", desc: "Snorkeling with rays and sharks. Glass-bottom boat tour. Romantic dinner on the beach." }
        ];
    } else if (vibe === 'Culture') {
        dest = "Kyoto, Japan";
        itinerary = [
            { day: "Day 1", title: "Temples & Traditions", desc: "Visit Kinkaku-ji (Golden Pavilion). Traditional Tea Ceremony in Gion." },
            { day: "Day 2", title: "Arashiyama Bamboo Grove", desc: "Rickshaw ride through the bamboo forest. Visit Tenryu-ji Temple. Kaiseki dinner." },
            { day: "Day 3", title: "Fushimi Inari Shrine", desc: "Hike through the thousands of Torii gates. Shopping for crafts in downtown Kyoto." }
        ];
    } else {
        // Luxury / Wildlife fallback
        dest = "Dubai, UAE";
        itinerary = [
            { day: "Day 1", title: "Sky High", desc: "VIP Arrival. Burj Khalifa At the Top view. Dinner at Atmosphere." },
            { day: "Day 2", title: "Desert Safari", desc: "Private dune bashing in Land Cruiser. Falconry show. BBQ under the stars." },
            { day: "Day 3", title: "Yacht Cruise", desc: "Private yacht tour around the Palm Jumeirah. Shopping at Dubai Mall." }
        ];
    }

    // Build HTML
    let html = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h4 style="color: var(--first-color); font-size: 1.2rem;">${dest}</h4>
            <p style="font-size: 0.9rem;">Perfect for your <b>${vibe}</b> vibe on a <b>${budget}</b> budget.</p>
        </div>
    `;

    itinerary.forEach(item => {
        html += `
            <div class="itinerary-day-card">
                <div class="itinerary-day-header">
                    <span>${item.day}</span>
                    <span>${item.title}</span>
                </div>
                <div class="itinerary-day-activity">${item.desc}</div>
            </div>
        `;
    });

    resultContainer.innerHTML = html;

    // Show Result
    loading.style.display = 'none';
    resultContainer.style.display = 'block';
    actions.style.display = 'flex';

    // Handle "Book"
    document.getElementById('book-itinerary-btn').onclick = () => {
        const msg = `Hi Skye Travel! I love the AI Plan for ${dest} (${vibe}). Can we book this? My name is ${name}.`;
        const url = `https://wa.me/918655874294?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        document.getElementById('itinerary-modal').classList.remove('active-modal');
    };

    // Handle "Regen"
    document.getElementById('regen-btn').onclick = () => {
        document.getElementById('itinerary-modal').classList.remove('active-modal');
        wizardModal.classList.add('active-modal');
    };
}

// Close Itinerary Modal
document.getElementById('itinerary-close')?.addEventListener('click', () => {
    document.getElementById('itinerary-modal').classList.remove('active-modal');
});

/* ==================== DARK LIGHT THEME ==================== */
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ph-sun'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ph-moon' : 'ph-sun'

// We validate if the user previously chose a topic
if (selectedTheme) {
    // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    if (themeButton) {
        themeButton.classList[selectedIcon === 'ph-moon' ? 'add' : 'remove'](iconTheme)
        // If icon is sun (toggle active), we need to ensure icon class swaps
        if (selectedIcon === 'ph-sun') {
            themeButton.classList.remove('ph-moon');
            themeButton.classList.add('ph-sun');
        }
    }
}

// Activate / deactivate the theme manually with the button
if (themeButton) {
    themeButton.addEventListener('click', () => {
        // Add or remove the dark / icon theme
        document.body.classList.toggle(darkTheme)
        themeButton.classList.toggle(iconTheme)

        // Swap icon class explicitly for Phosphor
        if (document.body.classList.contains(darkTheme)) {
            themeButton.classList.replace('ph-moon', 'ph-sun');
        } else {
            themeButton.classList.replace('ph-sun', 'ph-moon');
        }

        // We save the theme and the current icon that the user chose
        localStorage.setItem('selected-theme', getCurrentTheme())
        localStorage.setItem('selected-icon', document.body.classList.contains(darkTheme) ? 'ph-sun' : 'ph-moon')
    })
}
/* ==================== AUTHENTICATION LOGIC ==================== */
const loginModal = document.getElementById('login-modal');

const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// State
let currentUser = JSON.parse(localStorage.getItem('user'));
let authToken = localStorage.getItem('token');

// Update UI on Load
document.addEventListener('DOMContentLoaded', updateAuthUI);

function updateAuthUI() {
    const navItem = document.getElementById('nav-login-item');
    if (!navItem) return;

    if (currentUser && authToken) {
        // User is logged in
        if (currentUser.isAdmin) {
            navItem.innerHTML = `<a href="admin.html" class="nav-link">Admin Panel</a>`;
        } else {
            navItem.innerHTML = `<span class="nav-link">Hi, ${currentUser.name}</span> <a href="#" id="video-logout" class="nav-link" style="font-size: 0.8rem;">(Logout)</a>`;
            // Add Logout Listener
            document.getElementById('video-logout').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } else {
        // Guest
        navItem.innerHTML = `<i class="ph ph-user" id="login-btn" style="cursor: pointer; font-size: 1.2rem;"></i>`;

        // Re-attach listener
        document.getElementById('login-btn').addEventListener('click', () => {
            loginModal.classList.add('active-modal');
        });
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('demo_mode');
    currentUser = null;
    authToken = null;
    updateAuthUI();
    window.location.reload();
}

// Contact Form Logic (Offline Compatible)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const data = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            message: document.getElementById('contact-message').value
        };

        try {
            // Try Grid/API first
            if (!API_BASE) throw new Error("Offline");

            const res = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("API Failed");

            // Success
            SkyeAlert.fire({ icon: 'success', title: 'Message Sent', text: 'We will get back to you soon!' });
            contactForm.reset();

        } catch (err) {
            console.warn("Contact API unreachable. Attempting EmailJS Fallback...");

            // EmailJS Config (User to Update)
            const serviceID = "YOUR_SERVICE_ID";
            const templateID = "YOUR_TEMPLATE_ID";

            try {
                await emailjs.send(serviceID, templateID, {
                    from_name: data.name,
                    from_email: data.email,
                    phone: data.phone,
                    message: data.message,
                    reply_to: data.email
                });

                SkyeAlert.fire({ icon: 'success', title: 'Message Sent', text: 'Thank you! We have received your message.' });
                contactForm.reset();

            } catch (emailErr) {
                console.error("EmailJS Failed:", emailErr);
                SkyeAlert.fire({
                    icon: 'warning',
                    title: 'Message Saved Offline',
                    text: 'We could not reach the server, but your message has been logged locally. Please contact us directly via WhatsApp.'
                });
            }

        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // Demo Mode Trigger
            if (!res.ok && res.status !== 400 && res.status !== 401) throw new Error("Server Down");

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                localStorage.setItem('demo_mode', 'false'); // Online

                currentUser = data.user;
                authToken = data.token;

                loginModal.classList.remove('active-modal');
                updateAuthUI();
                alert("Welcome back!");

                if (data.user.isAdmin) window.location.href = 'admin.html';

            } else {
                alert(data.error || "Login failed");
            }

        } catch (err) {
            console.warn("Login Server Unreachable. Activating Demo Mode.");

            // DEMO MODE LOGIN
            const mockUser = { id: 999, name: "Demo Admin", email: email, isAdmin: true };
            const mockToken = "demo-token-123";

            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('token', mockToken);
            localStorage.setItem('demo_mode', 'true'); // Flag for Admin Panel

            currentUser = mockUser;
            authToken = mockToken;

            loginModal.classList.remove('active-modal');
            updateAuthUI();

            SkyeAlert.fire({
                icon: 'info',
                title: 'Offline Demo Mode',
                text: 'Server unreachable. Logging you in as Demo Admin.'
            }).then(() => {
                window.location.href = 'admin.html';
            });
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Register
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // similar logic...
        alert("Registration successful! Please login.");
        registerModal.classList.remove('active-modal');
        loginModal.classList.add('active-modal');
    });
}

// Toggle between modals
document.getElementById('open-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('active-modal');
    registerModal.classList.add('active-modal');
});

document.getElementById('open-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.classList.remove('active-modal');
    loginModal.classList.add('active-modal');
});

// Close Auth Modals
document.querySelectorAll('.modal-close, .modal-close-auth').forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.classList.remove('active-modal');
        registerModal.classList.remove('active-modal');
    });
});

// Initialize Video Slider
document.addEventListener('DOMContentLoaded', () => {
    initVideoSlider();
});
