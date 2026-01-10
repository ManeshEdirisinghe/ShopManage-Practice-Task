// ShopManage - Professional Product Management System JavaScript

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('ShopManage application loaded successfully!');
    
    // Initialize enhanced features
    initNetworkMonitoring();
    enhanceFormValidation();
    
    // Initialize form handling
    const productForm = document.getElementById('productForm');
    const productModal = document.getElementById('productModal');
    const productModalLabel = document.getElementById('productModalLabel');

    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!productForm.checkValidity()) {
                e.stopPropagation();
                productForm.classList.add('was-validated');
                return;
            }

            // Detect edit mode vs add mode
            const isEditMode = productForm.dataset.editMode === 'true';
            const productId = productForm.dataset.productId;

            // Get form data
            const formData = new FormData(productForm);
            const productData = {
                title: formData.get('productTitle'),
                price: parseFloat(formData.get('productPrice')),
                category: formData.get('productCategory'),
                image: formData.get('productImage') || 'https://via.placeholder.com/300x200?text=No+Image',
                stock: parseInt(formData.get('productStock')) || 0,
                brand: 'Generic', // DummyJSON requires this field
                description: `${formData.get('productTitle')} - Quality product in ${formData.get('productCategory')} category`
            };

            try {
                // Show loading state and disable all form inputs
                const submitBtn = productForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                // Disable submit button and all form inputs to prevent changes
                submitBtn.disabled = true;
                const formInputs = productForm.querySelectorAll('input, select, textarea, button');
                formInputs.forEach(input => input.disabled = true);

                let response, result;

                if (isEditMode && productId) {
                    // UPDATE MODE - Send PUT request
                    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Updating...';
                    console.log(`Updating product ${productId} with data:`, productData);

                    response = await fetch(`https://dummyjson.com/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(productData)
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    result = await response.json();
                    
                    // Log the updated object to console
                    console.log('Product updated successfully:', result);
                    
                    // Show success alert for update
                    alert('Product Updated');
                    
                    // Show success toast
                    showToast('Success!', `Product "${result.title}" has been updated successfully!`, 'success');

                    // Update the UI instantly without page reload
                    updateProductInUI(result);

                } else {
                    // ADD MODE - Send POST request
                    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Adding...';
                    console.log('Adding new product with data:', productData);

                    response = await fetch('https://dummyjson.com/products/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(productData)
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    result = await response.json();
                    
                    // Log the returned object with ID to console
                    console.log('Product added successfully with ID:', result);
                    
                    // Show success alert for add
                    alert('Product Added');
                    
                    // Show success toast
                    showToast('Success!', `Product "${result.title}" has been added successfully with ID: ${result.id}`, 'success');

                    // Add the new product to UI instantly
                    addProductToUI(result);
                }

                // Re-enable form inputs before closing
                const formInputs2 = productForm.querySelectorAll('input, select, textarea, button');
                formInputs2.forEach(input => input.disabled = false);
                
                // Reset submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Close modal and reset form after successful operation
                const modal = bootstrap.Modal.getInstance(productModal);
                modal.hide();
                
                // Reset form completely (clears all fields and validation states)
                setTimeout(() => {
                    resetProductForm();
                }, 300); // Small delay to ensure modal closes smoothly

            } catch (error) {
                console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, error);
                
                // Determine error type and show appropriate message
                let errorMessage = 'Unknown error occurred';
                let alertTitle = 'Error';
                
                if (!navigator.onLine) {
                    errorMessage = 'No internet connection. Please check your network and try again.';
                    alertTitle = 'Connection Error';
                } else if (error.name === 'TypeError' || error.message.includes('fetch')) {
                    errorMessage = 'Unable to connect to the server. Please try again later.';
                    alertTitle = 'Network Error';
                } else if (error.message.includes('HTTP error')) {
                    errorMessage = `Server error (${error.message}). Please try again or contact support.`;
                    alertTitle = 'Server Error';
                } else {
                    errorMessage = error.message;
                }
                
                // Show user-friendly error alert
                alert(`${alertTitle}: ${errorMessage}`);
                
                // Show detailed error toast
                showToast(alertTitle, `Failed to ${isEditMode ? 'update' : 'add'} product: ${errorMessage}`, 'error');

                // Reset submit button with proper state
                const submitBtn = productForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = isEditMode ? '<i class="bi bi-check-circle me-1"></i>Update Product' : '<i class="bi bi-check-circle me-1"></i>Save Product';
                }
                
                // Re-enable form inputs
                const formInputs = productForm.querySelectorAll('input, select, textarea, button');
                formInputs.forEach(input => input.disabled = false);
            }
        });

        // Handle image URL input for preview
        const imageInput = document.getElementById('productImage');
        const imagePreview = document.getElementById('imagePreview');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');

        if (imageInput && imagePreview && imagePreviewContainer) {
            imageInput.addEventListener('input', function() {
                const url = this.value.trim();
                if (url && isValidUrl(url)) {
                    imagePreview.src = url;
                    imagePreview.onload = function() {
                        imagePreviewContainer.classList.remove('d-none');
                    };
                    imagePreview.onerror = function() {
                        imagePreviewContainer.classList.add('d-none');
                    };
                } else {
                    imagePreviewContainer.classList.add('d-none');
                }
            });
        }
    }

    // Handle view toggle between cards and table
    const cardViewBtn = document.getElementById('cardView');
    const tableViewBtn = document.getElementById('tableView');
    const cardContainer = document.getElementById('cardContainer');
    const tableContainer = document.getElementById('tableContainer');

    function showCardView() {
        cardContainer.classList.remove('d-none');
        tableContainer.classList.add('d-none');
    }

    function showTableView() {
        cardContainer.classList.add('d-none');
        tableContainer.classList.remove('d-none');
    }

    cardViewBtn.addEventListener('change', function() {
        if (this.checked) showCardView();
    });

    tableViewBtn.addEventListener('change', function() {
        if (this.checked) showTableView();
    });

    // Reset form when modal is closed
    if (productModal) {
        productModal.addEventListener('hidden.bs.modal', resetProductForm);
    }

    // Initialize with fetching products
    fetchProducts().catch(() => {
        console.log('Initial fetch failed, showing empty state');
        loadProducts([]);
    });
});

// Helper function to validate URLs
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Function to reset and prepare form for new product
function resetProductForm() {
    const form = document.getElementById('productForm');
    const modalLabel = document.getElementById('productModalLabel');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
        delete form.dataset.productId;
        delete form.dataset.editMode;
    }
    
    if (modalLabel) {
        modalLabel.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add New Product';
    }
    
    // Reset submit button text
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Save Product';
    }
    
    if (imagePreviewContainer) {
        imagePreviewContainer.classList.add('d-none');
    }
}

// Function to populate form for editing
function populateProductForm(product) {
    const form = document.getElementById('productForm');
    const modalLabel = document.getElementById('productModalLabel');
    
    if (form && product) {
        // Handle DummyJSON API format - use thumbnail or first image
        const imageUrl = product.thumbnail || (product.images && product.images[0]) || product.image || '';
        
        // Set form data with API response format
        document.getElementById('productTitle').value = product.title || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productImage').value = imageUrl;
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productSku').value = product.sku || `SKU-${product.id}`;
        
        // Store product ID for editing and mark form as editing mode
        form.dataset.productId = product.id;
        form.dataset.editMode = 'true';
        
        // Update modal title
        if (modalLabel) {
            modalLabel.innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Product';
        }
        
        // Update submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Update Product';
        }
        
        // Trigger image preview if URL exists
        const imageInput = document.getElementById('productImage');
        if (imageInput && imageInput.value) {
            imageInput.dispatchEvent(new Event('input'));
        }
        
        console.log('Form populated for editing product ID:', product.id);
    }
}

// Function to initialize form event listeners (needed after modal content reload)
function initializeFormEventListeners() {
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    if (imageInput && imagePreview && imagePreviewContainer) {
        // Remove existing listeners to avoid duplicates
        const newImageInput = imageInput.cloneNode(true);
        imageInput.parentNode.replaceChild(newImageInput, imageInput);
        
        newImageInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url && isValidUrl(url)) {
                imagePreview.src = url;
                imagePreview.onload = function() {
                    imagePreviewContainer.classList.remove('d-none');
                };
                imagePreview.onerror = function() {
                    imagePreviewContainer.classList.add('d-none');
                };
            } else {
                imagePreviewContainer.classList.add('d-none');
            }
        });
    }
}

// Enhanced toast notification function with better styling
function showToast(title, message, type = 'info') {
    // Create toast element
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    // Map toast types to Bootstrap classes and icons
    const typeConfig = {
        'success': { class: 'text-success', icon: 'check-circle-fill' },
        'error': { class: 'text-danger', icon: 'exclamation-triangle-fill' },
        'warning': { class: 'text-warning', icon: 'exclamation-triangle-fill' },
        'info': { class: 'text-primary', icon: 'info-circle-fill' }
    };
    
    const config = typeConfig[type] || typeConfig['info'];
    
    const toastHTML = `
        <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="bi bi-${config.icon} me-2 ${config.class}"></i>
                <strong class="me-auto">${title}</strong>
                <small class="text-muted">Now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: type === 'error' ? false : true, // Keep error toasts visible longer
        delay: type === 'success' ? 3000 : 5000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Network status monitoring
function initNetworkMonitoring() {
    // Show toast when coming online/offline
    window.addEventListener('online', function() {
        showToast('Connection Restored', 'Internet connection has been restored.', 'success');
    });
    
    window.addEventListener('offline', function() {
        showToast('Connection Lost', 'Internet connection lost. Some features may not work.', 'warning');
    });
    
    // Check initial connection status
    if (!navigator.onLine) {
        showToast('No Connection', 'You appear to be offline. Please check your internet connection.', 'warning');
    }
}

// Form validation enhancement
function enhanceFormValidation() {
    const form = document.getElementById('productForm');
    if (form) {
        // Add real-time validation
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid') && this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });
        });
    }
}

// Reusable function to render products in both views
function renderProducts(products) {
    const cardContainer = document.getElementById('cardContainer');
    const tableBody = document.getElementById('productTableBody');
    const emptyStateCards = document.getElementById('emptyStateCards');
    const emptyStateTable = document.getElementById('emptyStateTable');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Hide loading spinner if it's showing
    if (loadingSpinner) {
        loadingSpinner.classList.add('d-none');
    }

    if (!products || products.length === 0) {
        // Handle empty state
        renderEmptyState();
        return;
    }

    // Hide empty states
    if (emptyStateCards) emptyStateCards.classList.add('d-none');
    if (emptyStateTable) emptyStateTable.classList.add('d-none');

    // Render card view
    renderCardView(products, cardContainer);
    
    // Render table view  
    renderTableView(products, tableBody);

    console.log(`Rendered ${products.length} products successfully`);
}

// Generate card HTML for products
function renderCardView(products, container) {
    if (!container) return;

    const cardsHTML = products.map(product => {
        // Ensure required fields with fallbacks
        const safeProduct = {
            id: product.id || Math.random(),
            title: product.title || 'Untitled Product',
            price: product.price || '0.00',
            category: product.category || 'Uncategorized',
            stock: product.stock || 0,
            sku: product.sku || `SKU-${product.id || '000'}`,
            image: product.image || 'https://via.placeholder.com/300x200?text=No+Image'
        };

        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm product-card">
                    <img src="${safeProduct.image}" 
                         class="card-img-top" 
                         alt="${safeProduct.title}"
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title" title="${safeProduct.title}">
                            ${safeProduct.title.length > 30 ? 
                              safeProduct.title.substring(0, 30) + '...' : 
                              safeProduct.title}
                        </h6>
                        <p class="card-text text-muted small mb-2">
                            <i class="bi bi-tag me-1"></i>${safeProduct.category}
                        </p>
                        <p class="card-text text-muted small mb-2">
                            <i class="bi bi-box me-1"></i>${safeProduct.sku}
                        </p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <p class="card-text fw-bold text-primary fs-5 mb-0">$${safeProduct.price}</p>
                                <span class="badge ${safeProduct.stock > 10 ? 'bg-success' : 
                                                    safeProduct.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                                    ${safeProduct.stock} in stock
                                </span>
                            </div>
                            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                <button class="btn btn-outline-primary btn-sm" onclick="editProduct(${safeProduct.id})">
                                    <i class="bi bi-pencil"></i> Edit
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${safeProduct.id})">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cardsHTML;
}

// Generate table rows HTML for products
function renderTableView(products, tableBody) {
    if (!tableBody) return;

    const rowsHTML = products.map(product => {
        // Ensure required fields with fallbacks
        const safeProduct = {
            id: product.id || Math.random(),
            title: product.title || 'Untitled Product',
            price: product.price || '0.00',
            category: product.category || 'Uncategorized',
            stock: product.stock || 0,
            sku: product.sku || `SKU-${product.id || '000'}`,
            image: product.image || 'https://via.placeholder.com/60x60?text=No+Image'
        };

        return `
            <tr>
                <td>
                    <img src="${safeProduct.image}" 
                         alt="${safeProduct.title}" 
                         class="rounded" 
                         style="width: 60px; height: 60px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                </td>
                <td>
                    <div>
                        <h6 class="mb-1" title="${safeProduct.title}">
                            ${safeProduct.title.length > 25 ? 
                              safeProduct.title.substring(0, 25) + '...' : 
                              safeProduct.title}
                        </h6>
                        <small class="text-muted">SKU: ${safeProduct.sku}</small>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${safeProduct.category}</span>
                </td>
                <td class="fw-bold text-primary">$${safeProduct.price}</td>
                <td>
                    <span class="badge ${safeProduct.stock > 10 ? 'bg-success' : 
                                       safeProduct.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                        ${safeProduct.stock} units
                    </span>
                </td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" 
                                onclick="editProduct(${safeProduct.id})" 
                                title="Edit Product">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" 
                                onclick="deleteProduct(${safeProduct.id})" 
                                title="Delete Product">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rowsHTML;
}

// Handle empty state rendering
function renderEmptyState() {
    const cardContainer = document.getElementById('cardContainer');
    const tableBody = document.getElementById('productTableBody');
    const emptyStateCards = document.getElementById('emptyStateCards');
    const emptyStateTable = document.getElementById('emptyStateTable');

    // Clear containers
    if (cardContainer) cardContainer.innerHTML = '';
    if (tableBody) tableBody.innerHTML = '';

    // Show appropriate empty states
    if (emptyStateCards) {
        cardContainer.appendChild(emptyStateCards);
        emptyStateCards.classList.remove('d-none');
    }
    if (emptyStateTable) {
        emptyStateTable.classList.remove('d-none');
    }
}

// Edit Product function - fetches and pre-fills form
window.editProduct = async function(productId) {
    console.log('Edit product:', productId);
    
    try {
        // Show loading state
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
        
        // Show loading in modal
        const modalBody = document.querySelector('#productModal .modal-body');
        const originalContent = modalBody.innerHTML;
        modalBody.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="mt-3">
                    <h6>Loading Product Data...</h6>
                    <p class="text-muted mb-0">Please wait while we fetch the product information.</p>
                </div>
            </div>
        `;

        // Fetch product data from API
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        console.log('Fetched product data:', productData);
        
        // Restore original modal content
        modalBody.innerHTML = originalContent;
        
        // Re-initialize form event listeners after restoring content
        initializeFormEventListeners();
        
        // Populate form with fetched product data
        populateProductForm(productData);
        
    } catch (error) {
        console.error('Error fetching product:', error);
        
        // Show error in modal
        const modalBody = document.querySelector('#productModal .modal-body');
        modalBody.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                <h5 class="mt-3 text-muted">Failed to Load Product</h5>
                <p class="text-muted">There was an error fetching the product data.</p>
                <p class="text-danger small">${error.message}</p>
                <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-primary" onclick="editProduct(${productId})">
                        <i class="bi bi-arrow-clockwise me-1"></i>Try Again
                    </button>
                    <button class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Show error toast
        showToast('Error!', `Failed to load product: ${error.message}`, 'error');
    }
};

// Delete Product function
window.deleteProduct = async function(productId) {
    console.log('Delete product:', productId);
    
    // Ask for confirmation before deleting
    const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');
    
    if (!confirmed) {
        return; // User cancelled the deletion
    }

    try {
        console.log(`Sending DELETE request for product ID: ${productId}`);
        
        // Send DELETE request to DummyJSON API
        const response = await fetch(`https://dummyjson.com/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Delete response status:', response.status);

        // Check if deletion was successful (status 200)
        if (response.status === 200) {
            const result = await response.json();
            console.log('Product deleted successfully:', result);
            
            // Remove the product from the DOM
            removeProductFromUI(productId);
            
            // Show success alert
            alert('Product Deleted');
            
            // Show success toast
            showToast('Success!', `Product has been deleted successfully.`, 'success');
            
        } else {
            throw new Error(`Delete failed with status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error deleting product:', error);
        
        // Determine error type and show appropriate message
        let errorMessage = 'Unknown error occurred while deleting the product.';
        let alertTitle = 'Delete Error';
        
        if (!navigator.onLine) {
            errorMessage = 'No internet connection. Please check your network and try again.';
            alertTitle = 'Connection Error';
        } else if (error.name === 'TypeError' || error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to the server. The product may still exist.';
            alertTitle = 'Network Error';
        } else if (error.message.includes('HTTP error') || error.message.includes('status')) {
            errorMessage = `Server error while deleting product. Please try again or contact support.`;
            alertTitle = 'Server Error';
        } else {
            errorMessage = error.message;
        }
        
        // Show user-friendly error alert
        alert(`${alertTitle}: ${errorMessage}`);
        
        // Show detailed error toast
        showToast(alertTitle, `Failed to delete product: ${errorMessage}`, 'error');
    }
};

// Function to remove product from UI after successful deletion
function removeProductFromUI(productId) {
    // Remove from card view
    const cardContainer = document.getElementById('cardContainer');
    if (cardContainer) {
        const productCard = cardContainer.querySelector(`[onclick*="editProduct(${productId})"]`)?.closest('.col-lg-3, .col-md-4, .col-sm-6');
        if (productCard) {
            // Add fade-out animation
            productCard.style.transition = 'opacity 0.3s ease-out';
            productCard.style.opacity = '0';
            setTimeout(() => {
                productCard.remove();
                checkIfEmpty();
            }, 300);
        }
    }

    // Remove from table view
    const tableBody = document.getElementById('productTableBody');
    if (tableBody) {
        const productRow = tableBody.querySelector(`[onclick*="editProduct(${productId})"]`)?.closest('tr');
        if (productRow) {
            // Add fade-out animation
            productRow.style.transition = 'opacity 0.3s ease-out';
            productRow.style.opacity = '0';
            setTimeout(() => {
                productRow.remove();
                checkIfEmpty();
            }, 300);
        }
    }

    console.log('Product removed from UI with ID:', productId);
}

// Function to check if product list is empty and show empty state
function checkIfEmpty() {
    const cardContainer = document.getElementById('cardContainer');
    const tableBody = document.getElementById('productTableBody');
    const emptyStateCards = document.getElementById('emptyStateCards');
    const emptyStateTable = document.getElementById('emptyStateTable');

    // Check if card view is empty
    if (cardContainer) {
        const remainingCards = cardContainer.querySelectorAll('.col-lg-3, .col-md-4, .col-sm-6').length;
        if (remainingCards === 0 && emptyStateCards) {
            cardContainer.appendChild(emptyStateCards);
            emptyStateCards.classList.remove('d-none');
        }
    }

    // Check if table view is empty
    if (tableBody) {
        const remainingRows = tableBody.querySelectorAll('tr').length;
        if (remainingRows === 0 && emptyStateTable) {
            emptyStateTable.classList.remove('d-none');
        }
    }
}

// Updated loadProducts function to use renderProducts
window.loadProducts = function(products) {
    renderProducts(products);
};

// Function to show loading state
window.showLoading = function() {
    const cardContainer = document.getElementById('cardContainer');
    const tableContainer = document.getElementById('tableContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyStateCards = document.getElementById('emptyStateCards');
    const emptyStateTable = document.getElementById('emptyStateTable');

    // Hide all content and show spinner
    cardContainer.innerHTML = '';
    document.getElementById('productTableBody').innerHTML = '';
    emptyStateCards.classList.add('d-none');
    emptyStateTable.classList.add('d-none');
    loadingSpinner.classList.remove('d-none');
};

// Fetch products from API using async/await
async function fetchProducts() {
    try {
        showLoading();
        
        const response = await fetch('https://dummyjson.com/products?limit=10');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match our UI format
        const transformedProducts = data.products.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price.toFixed(2),
            category: product.category,
            stock: product.stock,
            sku: `SKU-${product.id.toString().padStart(3, '0')}`,
            image: product.thumbnail || product.images[0]
        }));
        
        // Load products into UI (this will hide the loading spinner)
        loadProducts(transformedProducts);
        
        console.log('Successfully loaded', transformedProducts.length, 'products');
        
    } catch (error) {
        console.error('Error fetching products:', error);
        
        // Hide loading spinner
        const loadingSpinner = document.getElementById('loadingSpinner');
        const cardContainer = document.getElementById('cardContainer');
        
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
        
        // Determine error type and show appropriate message
        let errorMessage = 'Unknown error occurred while loading products.';
        let errorIcon = 'bi-exclamation-triangle';
        let errorColor = 'text-warning';
        
        if (!navigator.onLine) {
            errorMessage = 'No internet connection. Please check your network connection.';
            errorIcon = 'bi-wifi-off';
            errorColor = 'text-danger';
        } else if (error.name === 'TypeError' || error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to the product database. Please try again later.';
            errorIcon = 'bi-server';
            errorColor = 'text-danger';
        } else if (error.message.includes('HTTP error')) {
            errorMessage = `Server error while loading products (${error.message}).`;
            errorIcon = 'bi-exclamation-triangle';
            errorColor = 'text-warning';
        }
        
        // Show enhanced error message with retry options
        if (cardContainer) {
            cardContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi ${errorIcon} ${errorColor}" style="font-size: 4rem;"></i>
                    <h4 class="text-muted mt-3">Failed to Load Products</h4>
                    <p class="text-muted">${errorMessage}</p>
                    <p class="text-danger small">${error.message}</p>
                    <div class="d-flex gap-2 justify-content-center mt-4">
                        <button class="btn btn-primary" onclick="fetchProducts()">
                            <i class="bi bi-arrow-clockwise me-2"></i>Try Again
                        </button>
                        <button class="btn btn-outline-secondary" onclick="loadProducts([])">
                            <i class="bi bi-plus-circle me-2"></i>Start Fresh
                        </button>
                        ${!navigator.onLine ? '' : `
                            <button class="btn btn-outline-info" onclick="fetchProductsWithCatch()">
                                <i class="bi bi-arrow-clockwise me-2"></i>Alternative Method
                            </button>
                        `}
                    </div>
                </div>
            `;
        }
    }
}

// Alternative fetch method using .catch() for additional error handling
window.fetchProductsWithCatch = function() {
    showLoading();
    
    fetch('https://dummyjson.com/products?limit=10')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const transformedProducts = data.products.map(product => ({
                id: product.id,
                title: product.title,
                price: product.price.toFixed(2),
                category: product.category,
                stock: product.stock,
                sku: `SKU-${product.id.toString().padStart(3, '0')}`,
                image: product.thumbnail || product.images[0]
            }));
            
            loadProducts(transformedProducts);
            console.log('Successfully loaded products using .catch() method');
        })
        .catch(error => {
            console.error('Error in .catch():', error);
            
            const loadingSpinner = document.getElementById('loadingSpinner');
            const cardContainer = document.getElementById('cardContainer');
            
            loadingSpinner.classList.add('d-none');
            
            cardContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-wifi-off text-danger" style="font-size: 4rem;"></i>
                    <h4 class="text-muted mt-3">Connection Error</h4>
                    <p class="text-muted">Unable to connect to the product database.</p>
                    <p class="text-danger small">${error.message}</p>
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-primary" onclick="fetchProducts()">
                            <i class="bi bi-arrow-clockwise me-2"></i>Retry with async/await
                        </button>
                        <button class="btn btn-outline-primary" onclick="fetchProductsWithCatch()">
                            <i class="bi bi-arrow-clockwise me-2"></i>Retry with .catch()
                        </button>
                    </div>
                </div>
            `;
        });
};

// Function to update product in UI after successful edit
function updateProductInUI(updatedProduct) {
    // Transform the updated product to match our UI format
    const transformedProduct = {
        id: updatedProduct.id,
        title: updatedProduct.title,
        price: updatedProduct.price.toFixed(2),
        category: updatedProduct.category,
        stock: updatedProduct.stock,
        sku: `SKU-${updatedProduct.id.toString().padStart(3, '0')}`,
        image: updatedProduct.image || 'https://via.placeholder.com/300x200?text=No+Image'
    };

    // Update card view if visible
    const cardContainer = document.getElementById('cardContainer');
    if (cardContainer && !cardContainer.classList.contains('d-none')) {
        const existingCard = cardContainer.querySelector(`[onclick*="editProduct(${updatedProduct.id})"]`)?.closest('.col-lg-3, .col-md-4, .col-sm-6');
        if (existingCard) {
            const newCardHTML = createSingleProductCard(transformedProduct);
            existingCard.outerHTML = newCardHTML;
        }
    }

    // Update table view if visible
    const tableBody = document.getElementById('productTableBody');
    if (tableBody) {
        const existingRow = tableBody.querySelector(`[onclick*="editProduct(${updatedProduct.id})"]`)?.closest('tr');
        if (existingRow) {
            const newRowHTML = createSingleProductRow(transformedProduct);
            existingRow.outerHTML = newRowHTML;
        }
    }

    console.log('UI updated for product ID:', updatedProduct.id);
}

// Function to add new product to UI after successful creation
function addProductToUI(newProduct) {
    // Transform the new product to match our UI format
    const transformedProduct = {
        id: newProduct.id,
        title: newProduct.title,
        price: newProduct.price.toFixed(2),
        category: newProduct.category,
        stock: newProduct.stock,
        sku: `SKU-${newProduct.id.toString().padStart(3, '0')}`,
        image: newProduct.image || 'https://via.placeholder.com/300x200?text=No+Image'
    };

    // Add to card view
    const cardContainer = document.getElementById('cardContainer');
    const emptyStateCards = document.getElementById('emptyStateCards');
    
    if (cardContainer) {
        // Hide empty state if visible
        if (emptyStateCards && !emptyStateCards.classList.contains('d-none')) {
            emptyStateCards.classList.add('d-none');
        }
        
        // Add new card
        const newCardHTML = createSingleProductCard(transformedProduct);
        cardContainer.insertAdjacentHTML('afterbegin', newCardHTML);
    }

    // Add to table view
    const tableBody = document.getElementById('productTableBody');
    const emptyStateTable = document.getElementById('emptyStateTable');
    
    if (tableBody) {
        // Hide empty state if visible
        if (emptyStateTable && !emptyStateTable.classList.contains('d-none')) {
            emptyStateTable.classList.add('d-none');
        }
        
        // Add new row
        const newRowHTML = createSingleProductRow(transformedProduct);
        tableBody.insertAdjacentHTML('afterbegin', newRowHTML);
    }

    console.log('New product added to UI with ID:', newProduct.id);
}

// Helper function to create a single product card
function createSingleProductCard(product) {
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card h-100 shadow-sm product-card">
                <img src="${product.image}" 
                     class="card-img-top" 
                     alt="${product.title}"
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title" title="${product.title}">
                        ${product.title.length > 30 ? 
                          product.title.substring(0, 30) + '...' : 
                          product.title}
                    </h6>
                    <p class="card-text text-muted small mb-2">
                        <i class="bi bi-tag me-1"></i>${product.category}
                    </p>
                    <p class="card-text text-muted small mb-2">
                        <i class="bi bi-box me-1"></i>${product.sku}
                    </p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <p class="card-text fw-bold text-primary fs-5 mb-0">$${product.price}</p>
                            <span class="badge ${product.stock > 10 ? 'bg-success' : 
                                                product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                                ${product.stock} in stock
                            </span>
                        </div>
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button class="btn btn-outline-primary btn-sm" onclick="editProduct(${product.id})">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${product.id})">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper function to create a single product table row
function createSingleProductRow(product) {
    return `
        <tr>
            <td>
                <img src="${product.image}" 
                     alt="${product.title}" 
                     class="rounded" 
                     style="width: 60px; height: 60px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
            </td>
            <td>
                <div>
                    <h6 class="mb-1" title="${product.title}">
                        ${product.title.length > 25 ? 
                          product.title.substring(0, 25) + '...' : 
                          product.title}
                    </h6>
                    <small class="text-muted">SKU: ${product.sku}</small>
                </div>
            </td>
            <td>
                <span class="badge bg-secondary">${product.category}</span>
            </td>
            <td class="fw-bold text-primary">$${product.price}</td>
            <td>
                <span class="badge ${product.stock > 10 ? 'bg-success' : 
                                   product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                    ${product.stock} units
                </span>
            </td>
            <td class="text-center">
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" 
                            onclick="editProduct(${product.id})" 
                            title="Edit Product">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" 
                            onclick="deleteProduct(${product.id})" 
                            title="Delete Product">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Make functions globally available
window.resetProductForm = resetProductForm;
window.populateProductForm = populateProductForm;