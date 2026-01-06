// Index page specific functionality
document.addEventListener('DOMContentLoaded', function() {
  const serviceDropdown = document.getElementById('serviceDropdown');
  const countryDropdown = document.getElementById('countryDropdown');
  const appButton = document.getElementById('appButton');

  if (!serviceDropdown || !countryDropdown || !appButton) {
    return; // Elements not found, exit early
  }

  let allServices = [];
  let selectedCountryCode = null;
  let selectedServiceData = null;
  let selectedCountryData = null;

  // Fetch and populate countries
  async function loadCountries() {
    try {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      const data = await response.json();
      if (data.success && data.countries) {
        countryDropdown.innerHTML = '<option selected disabled>Select a country</option>';
        
        data.countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country.code;
          option.textContent = country.name;
          option.dataset.dialCode = country.dial_code;
          countryDropdown.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      countryDropdown.innerHTML = '<option selected disabled>Error loading countries</option>';
    }
  }

  // Fetch and populate all services
  async function loadAllServices() {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const data = await response.json();
      if (data.success && data.services) {
        allServices = data.services;
        updateServiceDropdown();
      }
    } catch (error) {
      console.error('Error loading services:', error);
      serviceDropdown.innerHTML = '<option selected disabled>Error loading services</option>';
    }
  }

  // Update service dropdown based on selected country
  function updateServiceDropdown() {
    if (!selectedCountryCode) {
      serviceDropdown.innerHTML = '<option selected disabled>Select a country first</option>';
      return;
    }

    const filteredServices = allServices.filter(service => service.country === selectedCountryCode);
    
    serviceDropdown.innerHTML = '<option selected disabled>Select a service</option>';
    
    if (filteredServices.length === 0) {
      serviceDropdown.innerHTML += '<option disabled>No services available for this country</option>';
      return;
    }

    filteredServices.forEach(service => {
      const option = document.createElement('option');
      option.value = service.service;
      option.textContent = service.serviceDescription;
      option.dataset.price = service.price;
      serviceDropdown.appendChild(option);
    });
  }

  // Handle country selection
  countryDropdown.addEventListener('change', function() {
    selectedCountryCode = this.value;
    selectedCountryData = {
      code: this.value,
      name: this.options[this.selectedIndex].textContent,
      dialCode: this.options[this.selectedIndex].dataset.dialCode
    };
    
    // Reset service selection
    serviceDropdown.value = '';
    selectedServiceData = null;
    
    // Update services dropdown
    updateServiceDropdown();
    
    // Enable/disable button
    updateButtonState();
  });

  // Handle service selection
  serviceDropdown.addEventListener('change', function() {
    if (this.value && this.selectedIndex > 0) {
      selectedServiceData = {
        code: this.value,
        name: this.options[this.selectedIndex].textContent,
        price: this.options[this.selectedIndex].dataset.price
      };
    } else {
      selectedServiceData = null;
    }
    
    updateButtonState();
  });

  // Update button state
  function updateButtonState() {
    if (selectedCountryCode && selectedServiceData) {
      appButton.disabled = false;
      appButton.style.opacity = '1';
      appButton.style.cursor = 'pointer';
    } else {
      appButton.disabled = true;
      appButton.style.opacity = '0.6';
      appButton.style.cursor = 'not-allowed';
    }
  }

  // Handle button click
  appButton.addEventListener('click', function() {
    if (!selectedCountryCode || !selectedServiceData) {
      alert('Please select both a country and a service');
      return;
    }

    // Store in localStorage (matching the format used in app.js)
    localStorage.setItem('selectedCountry', selectedCountryData.name);
    localStorage.setItem('selectedCountryCode', selectedCountryData.code);
    localStorage.setItem('selectedDialCode', selectedCountryData.dialCode);
    localStorage.setItem('selectedService', selectedServiceData.name);
    localStorage.setItem('selectedServiceCode', selectedServiceData.code);
    localStorage.setItem('selectedPrice', selectedServiceData.price);

    // Redirect to confirm page
    window.location.href = '/app/confirm';
  });

  // Initialize
  loadCountries();
  loadAllServices();
  updateButtonState();
});

