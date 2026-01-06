// Blog Detail Page Functionality

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

// Function to load blog detail
function loadBlogDetail() {
  // Get blog ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = parseInt(urlParams.get('id'));

  if (!blogId) {
    // If no ID, redirect to blog list
    window.location.href = '/blog';
    return;
  }

  // Find the blog post
  const blog = blogPosts.find(b => b.id === blogId);

  if (!blog) {
    // If blog not found, redirect to blog list
    window.location.href = '/blog';
    return;
  }

  // Update page title
  document.title = `${blog.title} - Temp Number`;

  // Set blog image/icon
  const blogDetailImg = document.getElementById('blogDetailImg');
  if (blogDetailImg) {
    blogDetailImg.innerHTML = `<i class="fas ${getCategoryIcon(blog.category)}"></i>`;
  }

  // Set blog meta
  const blogDetailMeta = document.getElementById('blogDetailMeta');
  if (blogDetailMeta) {
    blogDetailMeta.innerHTML = `
      <span><i class="fas fa-user"></i> ${blog.author}</span>
      <span><i class="fas fa-tag"></i> ${blog.category}</span>
    `;
  }

  // Set blog title
  const blogDetailTitle = document.getElementById('blogDetailTitle');
  if (blogDetailTitle) {
    blogDetailTitle.textContent = blog.title;
  }

  // Set blog content
  const blogDetailContent = document.getElementById('blogDetailContent');
  if (blogDetailContent) {
    // Check if blog has sections structure
    if (blog.sections && Array.isArray(blog.sections)) {
      blogDetailContent.innerHTML = renderSections(blog.sections);
    } else if (blog.content) {
      blogDetailContent.innerHTML = blog.content;
    }
  }
}

// Function to render sections-based content
function renderSections(sections) {
  let html = '';
  
  sections.forEach((section, index) => {
    html += `<div class="blog-section-content mb-4">`;
    html += `<h3 class="section-heading mb-3">${section.heading}</h3>`;
    
    if (section.paragraphs && Array.isArray(section.paragraphs)) {
      section.paragraphs.forEach(paragraph => {
        // Check if paragraph starts with "Step" for special formatting
        if (paragraph.trim().startsWith('Step ')) {
          html += `<p class="step-paragraph mb-3"><strong>${paragraph}</strong></p>`;
        } else {
          html += `<p class="mb-3">${paragraph}</p>`;
        }
      });
    }
    
    html += `</div>`;
  });
  
  return html;
}

// Initialize blog detail on page load
document.addEventListener('DOMContentLoaded', () => {
  loadBlogDetail();
});

