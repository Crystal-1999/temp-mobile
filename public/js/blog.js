// Blog Functionality - Handles blog card rendering and navigation

// Pagination configuration
const BLOGS_PER_PAGE = 6;
let currentPage = 1;
let searchQuery = '';

// Function to get icon for category
function getCategoryIcon(category) {
  const icons = {
    'Privacy & Security': 'fa-shield-halved',
    'Guide': 'fa-book',
    'Troubleshooting': 'fa-wrench',
    'Future Trends': 'fa-chart-line'
  };
  return icons[category] || 'fa-file-lines';
}

// Function to get current page and search query from URL
function getCurrentPageFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page')) || 1;
  return Math.max(1, page);
}

function getSearchQueryFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('search') || '';
}

// Function to filter blogs based on search query
function filterBlogs() {
  if (!searchQuery.trim()) {
    return blogPosts;
  }

  const query = searchQuery.toLowerCase().trim();
  return blogPosts.filter(blog => {
    // Search in title
    const titleMatch = blog.title.toLowerCase().includes(query);
    
    // Search in excerpt
    const excerptMatch = blog.excerpt.toLowerCase().includes(query);
    
    // Search in category
    const categoryMatch = blog.category.toLowerCase().includes(query);
    
    // Search in content sections (headings and paragraphs)
    let contentMatch = false;
    if (blog.sections && Array.isArray(blog.sections)) {
      contentMatch = blog.sections.some(section => {
        const headingMatch = section.heading?.toLowerCase().includes(query);
        const paragraphMatch = section.paragraphs?.some(para => 
          para.toLowerCase().includes(query)
        );
        return headingMatch || paragraphMatch;
      });
    }
    
    return titleMatch || excerptMatch || categoryMatch || contentMatch;
  });
}

// Function to get filtered blogs
function getFilteredBlogs() {
  return filterBlogs();
}

// Function to calculate total pages based on filtered blogs
function getTotalPages() {
  const filteredBlogs = getFilteredBlogs();
  return Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);
}

// Function to get blogs for current page
function getBlogsForCurrentPage() {
  const filteredBlogs = getFilteredBlogs();
  const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
  const endIndex = startIndex + BLOGS_PER_PAGE;
  return filteredBlogs.slice(startIndex, endIndex);
}

// Function to render blog cards
function renderBlogCards() {
  const blogList = document.getElementById('blogList');
  if (!blogList) return;
  
  blogList.innerHTML = '';

  const blogsToShow = getBlogsForCurrentPage();
  const totalFiltered = getFilteredBlogs().length;

  if (blogsToShow.length === 0) {
    const noResultsMessage = searchQuery.trim() 
      ? `<div class="col-12"><div class="no-results-message"><i class="fas fa-search"></i><h3>No blog found</h3><p>We couldn't find any blog posts matching "${searchQuery}". Try different keywords or clear your search.</p></div></div>`
      : '<div class="col-12"><p class="text-center">No blog posts found.</p></div>';
    blogList.innerHTML = noResultsMessage;
    return;
  }

  blogsToShow.forEach(blog => {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
      <div class="card blog-card" onclick="openBlogDetail(${blog.id})">
        <div class="blog-card-img">
          <i class="fas ${getCategoryIcon(blog.category)}"></i>
        </div>
        <div class="blog-card-body">
          <h5 class="blog-card-title">${blog.title}</h5>
          <p class="blog-card-text">${blog.excerpt}</p>
          <a href="#" class="read-more-btn" onclick="event.stopPropagation(); openBlogDetail(${blog.id})">
            Read More <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;
    blogList.appendChild(card);
  });
}

// Function to render pagination
function renderPagination() {
  const paginationContainer = document.getElementById('paginationContainer');
  if (!paginationContainer) return;

  const totalPages = getTotalPages();
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let paginationHTML = '<div class="pagination-wrapper"><ul class="pagination">';

  // Build query string for pagination links
  const buildPaginationURL = (page) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (page > 1) {
      params.set('page', page);
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="${buildPaginationURL(currentPage - 1)}" aria-label="Previous">
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>
    `;
  } else {
    paginationHTML += `
      <li class="page-item disabled">
        <span class="page-link" aria-label="Previous">
          <i class="fas fa-chevron-left"></i>
        </span>
      </li>
    `;
  }

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
  if (startPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="${buildPaginationURL(1)}">1</a>
      </li>
    `;
    if (startPage > 2) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  // Page number buttons
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      paginationHTML += `
        <li class="page-item active">
          <span class="page-link">${i}</span>
        </li>
      `;
    } else {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="${buildPaginationURL(i)}">${i}</a>
        </li>
      `;
    }
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="${buildPaginationURL(totalPages)}">${totalPages}</a>
      </li>
    `;
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="${buildPaginationURL(currentPage + 1)}" aria-label="Next">
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    `;
  } else {
    paginationHTML += `
      <li class="page-item disabled">
        <span class="page-link" aria-label="Next">
          <i class="fas fa-chevron-right"></i>
        </span>
      </li>
    `;
  }

  paginationHTML += '</ul></div>';
  paginationContainer.innerHTML = paginationHTML;

  // Add click handlers to prevent default and use smooth scrolling
  paginationContainer.querySelectorAll('.page-link').forEach(link => {
    if (!link.parentElement.classList.contains('disabled') && !link.parentElement.classList.contains('active')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          const urlParams = new URLSearchParams(href.replace('?', ''));
          const page = parseInt(urlParams.get('page')) || 1;
          goToPage(page);
        }
      });
    }
  });
}

// Function to navigate to a specific page
function goToPage(page) {
  currentPage = Math.max(1, Math.min(page, getTotalPages()));
  updateURL();
  scrollToTop();
  renderAll();
}

// Function to update search results count
function updateSearchResultsCount() {
  const resultsCountEl = document.getElementById('searchResultsCount');
  if (!resultsCountEl) return;

  const filteredBlogs = getFilteredBlogs();
  const total = filteredBlogs.length;

  if (searchQuery.trim()) {
    resultsCountEl.innerHTML = `
      <span class="results-count-text">
        Found <strong>${total}</strong> ${total === 1 ? 'blog' : 'blogs'} for "${searchQuery}"
      </span>
    `;
    resultsCountEl.style.display = 'block';
  } else {
    resultsCountEl.innerHTML = '';
    resultsCountEl.style.display = 'none';
  }
}

// Function to update URL with current page and search query
function updateURL() {
  const params = new URLSearchParams();
  
  if (searchQuery.trim()) {
    params.set('search', searchQuery.trim());
  }
  
  if (currentPage > 1) {
    params.set('page', currentPage);
  }
  
  const queryString = params.toString();
  const newURL = queryString ? `/blog?${queryString}` : '/blog';
  window.history.pushState({ page: currentPage, search: searchQuery }, '', newURL);
}

// Function to scroll to top
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to render all components
function renderAll() {
  renderBlogCards();
  renderPagination();
  updateSearchResultsCount();
}

// Function to handle search
function handleSearch(query) {
  searchQuery = query;
  currentPage = 1; // Reset to first page when searching
  updateURL();
  scrollToTop();
  renderAll();
  updateClearButton();
}

// Function to clear search
function clearSearch() {
  const searchInput = document.getElementById('blogSearchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  handleSearch('');
}

// Function to update clear button visibility
function updateClearButton() {
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.style.display = searchQuery.trim() ? 'flex' : 'none';
  }
}

// Function to redirect to blog detail page
function openBlogDetail(blogId) {
  // Redirect to blog detail page with blog ID as query parameter
  window.location.href = `/blog-detail?id=${blogId}`;
}

// Initialize blog cards on page load
document.addEventListener('DOMContentLoaded', () => {
  // Get initial values from URL
  currentPage = getCurrentPageFromURL();
  searchQuery = getSearchQueryFromURL();
  
  // Set search input value if there's a search query in URL
  const searchInput = document.getElementById('blogSearchInput');
  if (searchInput && searchQuery) {
    searchInput.value = searchQuery;
  }
  
  // Initial render
  renderAll();
  updateClearButton();
  
  // Setup search input event listeners
  if (searchInput) {
    let searchTimeout;
    
    // Real-time search with debounce
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;
      
      searchTimeout = setTimeout(() => {
        handleSearch(query);
      }, 300); // 300ms debounce
    });
    
    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimeout);
        handleSearch(e.target.value);
      }
    });
  }
  
  // Setup clear button
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearSearch();
    });
  }
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    currentPage = getCurrentPageFromURL();
    searchQuery = getSearchQueryFromURL();
    
    // Update search input
    if (searchInput) {
      searchInput.value = searchQuery;
    }
    
    updateClearButton();
    renderAll();
  });
});

