document.addEventListener('DOMContentLoaded', function () {
  const currentPage = window.location.pathname;

  if (currentPage.includes('/app/countries')) {
    fetchCountries();
    const continueButton = document.getElementById('continueButton');
    if (continueButton) {
      continueButton.disabled = true; // Disable the button initially
    }
  } else if (currentPage.includes('/app/services')) {
    fetchServices();
    const continueButton = document.getElementById('continueButton');
    if (continueButton) {
      continueButton.disabled = true; // Disable the button initially
    }
  }
});

// Step-level loader (covers the whole step card)
function showLoader() {
  const stepContainer = document.querySelector('.step-container');
  if (!stepContainer) {
    // Step container not found - silently return
    return;
  }

  let loader = stepContainer.querySelector('.step-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'step-loader';
    loader.innerHTML = `
      <div class="step-loader-backdrop"></div>
      <div class="step-loader-content">
        <div class="spinner-border text-primary" role="status" style="width: 2.5rem; height: 2.5rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    stepContainer.appendChild(loader);
  }
  loader.classList.add('is-visible');
}

function hideLoader() {
  const stepContainer = document.querySelector('.step-container');
  if (!stepContainer) return;
  const loader = stepContainer.querySelector('.step-loader');
  if (loader) {
    loader.classList.remove('is-visible');
  }
}

function selectCountry(countryCode, countryName, dialCode) {
  // console.log("Received:", { countryCode, countryName, dialCode }); // Debugging log
  
  localStorage.setItem('selectedCountry', countryName);
  localStorage.setItem('selectedCountryCode', countryCode);
  localStorage.setItem('selectedDialCode', dialCode);
  
  // Country stored in localStorage
  
  document.querySelectorAll('#countryList .list-group-item').forEach(item => {
    item.classList.remove('selected');
  });

  const selectedItem = document.querySelector(`[data-code="${countryCode}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }

  document.getElementById('continueButton').disabled = false;
}

function selectService(serviceCode, serviceName, price) {
  localStorage.setItem('selectedService', serviceName); // Store the service name
  localStorage.setItem('selectedServiceCode', serviceCode); // Store the service ID
  localStorage.setItem('selectedPrice', price); // Store the price
  // Service stored in localStorage

  // Remove previous selection
  document.querySelectorAll('#serviceList .list-group-item').forEach(item => {
    item.classList.remove('selected');
  });

  // Add selected class to the clicked item
  const selectedItem = Array.from(document.querySelectorAll('#serviceList .list-group-item'))
    .find(button => button.textContent.includes(serviceName));

  if (selectedItem) {
    selectedItem.classList.add('selected');
  }

  // Enable continue button
  document.getElementById('continueButton').disabled = false;
}

async function fetchCountries() {
  try {
    showLoader();
    const response = await fetch('/api/countries');
    
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP error! Status:', response.status, 'Response:', errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check content-type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON. Content-Type:', contentType, 'Response:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response. Please check the API endpoint.');
    }

    const data = await response.json();
    if (data.success) {
      populateCountryList(data.countries);
    } else {
      console.error('Failed to fetch countries:', data.message);
      showErrorMessage('Failed to load countries: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
    showErrorMessage('Error loading countries. Please refresh the page or try again later.');
  } finally {
    hideLoader();
  }
}

function showErrorMessage(message) {
  const countryList = document.getElementById('countryList');
  if (countryList) {
    countryList.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
      </div>
    `;
  }
}

function populateCountryList(countries) {
  const countryList = document.getElementById('countryList');
  countryList.innerHTML = '';

  countries.forEach(country => {
    const listItem = document.createElement('a');
    listItem.href = '#';
    listItem.className = 'list-group-item list-group-item-action';
    listItem.textContent = country.name;
    listItem.dataset.code = country.code;
    listItem.dataset.dialCode = country.dial_code;
    listItem.addEventListener('click', () => selectCountry(country.code, country.name, country.dial_code)); // Pass country code and name
    countryList.appendChild(listItem);
  });
}

async function fetchServices() {
  const countryCode = localStorage.getItem('selectedCountryCode'); // Retrieve the country code
  // Country code selected

  if (!countryCode) {
    showWarningToast('No country selected! Redirecting...');
    setTimeout(() => {
      window.location.href = '/app/countries';
    }, 2000);
    return;
  }

  try {
    showLoader();
    const response = await fetch('/api/services'); // Fetch all services

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP error while fetching services:', response.status, errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Services response is not JSON. Content-Type:', contentType, 'Response:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response for services.');
    }

    const data = await response.json();

    if (data.success) {
      // Filter services for the selected country code
      const filteredServices = data.services.filter(service => service.country === countryCode);
      // Services filtered
      displayServices(filteredServices);
    } else {
      document.getElementById('serviceList').innerHTML = `<p class="text-danger">Failed to fetch services.</p>`;
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    const serviceList = document.getElementById('serviceList');
    if (serviceList) {
      serviceList.innerHTML = `<div class="alert alert-danger" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Error loading services. Please refresh the page or try again later.
      </div>`;
    }
  } finally {
    hideLoader();
  }
}

function displayServices(services) {
  const serviceList = document.getElementById('serviceList');
  serviceList.innerHTML = '';

  if (services.length === 0) {
    serviceList.innerHTML = `<p class="text-warning">No services available for this country.</p>`;
    return;
  }

  services.forEach(service => {
    // Service data processed
    if (!service.service) {
      // Service ID missing - skipping
    }
    const button = document.createElement('button');
    button.className = 'list-group-item list-group-item-action';
    button.textContent = `${service.serviceDescription}`;
    button.onclick = () => selectService(service.service, service.serviceDescription, service.price);
    serviceList.appendChild(button);
  });
}