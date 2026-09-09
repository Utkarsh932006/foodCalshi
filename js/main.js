/* ============================================
   Healthy Ways — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.querySelector('.navbar');

  const handleNavScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ---- Mobile menu toggle ----
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  const closeMenu = () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
    navOverlay.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    navLinks.classList.add('active');
    navToggle.classList.add('active');
    navOverlay.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.contains('active') ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    if (navOverlay) navOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });

  // ---- Scroll-triggered fade-in animations ----
  const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // ---- Active nav link highlighting ----
  const sections = document.querySelectorAll('section[id]');
  const navLinkItems = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinkItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---- Counter animation ----
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  // ---- Newsletter / CTA form handling ----
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const successEl = form.parentElement.querySelector('.cta-success') ||
                        form.nextElementSibling;

      if (successEl) {
        successEl.classList.add('visible');
        setTimeout(() => successEl.classList.remove('visible'), 3000);
      }

      form.reset();
    });
  });

  // ============================================
  //  RECIPE SYSTEM
  // ============================================
  let recipes = [];

  // DOM refs — page-specific elements (null if not on that page)
  const homeGrid = document.getElementById('recipeGrid');
  const allGrid = document.getElementById('allRecipesGrid');
  const searchInput = document.getElementById('recipeSearch');
  const ingredientTagsEl = document.getElementById('ingredientTags');
  const activeFiltersEl = document.getElementById('activeFilters');
  const recipeCountEl = document.getElementById('recipeCount');
  const modalOverlay = document.getElementById('recipeModal');
  const modal = modalOverlay?.querySelector('.recipe-modal');
  const modalClose = modalOverlay?.querySelector('.recipe-modal-close');

  // ---- Fuzzy matching ----
  const fuzzyMatch = (query, text) => {
    query = query.toLowerCase();
    text = text.toLowerCase();
    if (text.includes(query)) return true;
    let qi = 0;
    for (let i = 0; i < text.length && qi < query.length; i++) {
      if (text[i] === query[qi]) qi++;
    }
    return qi === query.length;
  };

  // ---- Card HTML template ----
  const createCardHTML = (recipe, globalIndex) => `
    <article class="product-card fade-in" data-recipe="${globalIndex}">
      <div class="product-image" role="img" aria-label="${recipe.title}">${recipe.emoji}</div>
      <div class="product-info">
        <h3>${recipe.title}</h3>
        <p class="product-alt">Healthy alternative to <strong>${recipe.alt}</strong></p>
        <div class="product-macros">
          ${Object.entries(recipe.macros).map(([k, v]) => `<span>${k} ${v}</span>`).join('')}
        </div>
        <div class="product-footer">
          <span class="product-kcal">${recipe.kcal} kcal</span>
          <button class="btn btn-primary btn-sm recipe-btn">Know Recipe</button>
        </div>
      </div>
    </article>
  `;

  // ---- Render cards into a grid ----
  const renderCards = (grid, list) => {
    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="recipes-no-results">
          <h3>No recipes found</h3>
          <p>Try a different search or clear your filters</p>
        </div>`;
      return;
    }

    grid.innerHTML = list
      .map(r => createCardHTML(r, recipes.indexOf(r)))
      .join('');

    grid.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

    grid.querySelectorAll('.recipe-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const index = parseInt(card.dataset.recipe, 10);
        openRecipeModal(index);
      });
    });
  };

  // ---- Recipe Modal & Serving Scaler ----
  let currentRecipeIndex = null;
  let currentServings = 1;

  const servingCountEl = document.getElementById('servingCount');
  const servingDecBtn = document.getElementById('servingDec');
  const servingIncBtn = document.getElementById('servingInc');

  const updateModalNutrition = () => {
    const recipe = recipes[currentRecipeIndex];
    if (!recipe || !modal) return;

    if (servingCountEl) servingCountEl.textContent = currentServings;

    // Scale Macros
    modal.querySelector('.recipe-modal-macros ul').innerHTML =
      Object.entries(recipe.macros)
        .map(([k, v]) => {
          const num = parseFloat(v);
          const unit = v.replace(/[\d.]/g, '');
          const scaledVal = isNaN(num) ? v : `${Math.round(num * currentServings)}${unit}`;
          return `<li><span>${k}</span><span>${scaledVal}</span></li>`;
        })
        .join('');

    // Scale Micros
    modal.querySelector('.recipe-modal-micros ul').innerHTML =
      Object.entries(recipe.micros)
        .map(([k, v]) => {
          const num = parseFloat(v);
          const unit = v.replace(/[\d.]/g, '');
          const scaledVal = isNaN(num) ? v : `${Math.round(num * currentServings)}${unit}`;
          return `<li><span>${k}</span><span>${scaledVal}</span></li>`;
        })
        .join('');

    const totalKcal = Math.round(recipe.kcal * currentServings);
    const servingLabel = currentServings === 1 ? 'serving' : 'servings';
    modal.querySelector('.recipe-modal-kcal').textContent =
      `${totalKcal} kcal (${currentServings} ${servingLabel})`;
  };

  const openRecipeModal = (index, updateHash = true) => {
    const recipe = recipes[index];
    if (!recipe || !modal) return;

    currentRecipeIndex = index;
    currentServings = 1;

    modal.querySelector('.recipe-modal-emoji').textContent = recipe.emoji;
    modal.querySelector('.recipe-modal-title').textContent = recipe.title;
    modal.querySelector('.recipe-modal-alt').innerHTML =
      `Healthy alternative to <strong>${recipe.alt}</strong>`;

    updateModalNutrition();

    modal.querySelector('.recipe-modal-ingredients ul').innerHTML =
      recipe.ingredients.map(i => `<li>${i}</li>`).join('');

    modal.querySelector('.recipe-modal-steps ol').innerHTML =
      recipe.steps.map(s => `<li>${s}</li>`).join('');

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (updateHash && recipe.id) {
      history.pushState(null, '', `#${recipe.id}`);
    }
  };

  const closeRecipeModal = (updateHash = true) => {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentRecipeIndex = null;

    if (updateHash && window.location.hash) {
      history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  if (servingDecBtn) {
    servingDecBtn.addEventListener('click', () => {
      if (currentServings > 1) {
        currentServings--;
        updateModalNutrition();
      }
    });
  }

  if (servingIncBtn) {
    servingIncBtn.addEventListener('click', () => {
      if (currentServings < 12) {
        currentServings++;
        updateModalNutrition();
      }
    });
  }

  if (modalClose) modalClose.addEventListener('click', () => closeRecipeModal());

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeRecipeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeRecipeModal();
      }
    });
  }

  const checkUrlHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) {
      if (modalOverlay && modalOverlay.classList.contains('active')) {
        closeRecipeModal(false);
      }
      return;
    }
    const idx = recipes.findIndex(r => r.id === hash);
    if (idx !== -1) {
      openRecipeModal(idx, false);
    }
  };

  window.addEventListener('popstate', checkUrlHash);

  // ============================================
  //  HOMEPAGE — pinned recipes only
  // ============================================
  const initHomepage = () => {
    const pinned = recipes.filter(r => r.pinned);
    renderCards(homeGrid, pinned.length > 0 ? pinned : recipes.slice(0, 6));
  };

  // ============================================
  //  ALL RECIPES PAGE — search + ingredient filter
  // ============================================
  let selectedIngredients = [];
  let searchQuery = '';

  // Extract unique ingredients sorted by frequency
  const extractIngredients = () => {
    const map = {};
    recipes.forEach(r => {
      r.ingredients.forEach(ing => {
        const key = ing.toLowerCase().trim();
        if (!map[key]) map[key] = { display: ing, count: 0 };
        map[key].count++;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .map(v => v.display);
  };

  // Render clickable ingredient tag pills
  const renderIngredientTags = (ingredients) => {
    if (!ingredientTagsEl) return;

    ingredientTagsEl.innerHTML = ingredients
      .map(ing => {
        const key = ing.toLowerCase();
        const isActive = selectedIngredients.includes(key) ? ' active' : '';
        return `<button class="ingredient-tag${isActive}" data-ingredient="${key}">${ing}</button>`;
      })
      .join('');

    ingredientTagsEl.querySelectorAll('.ingredient-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const ing = tag.dataset.ingredient;

        if (selectedIngredients.includes(ing)) {
          selectedIngredients = selectedIngredients.filter(s => s !== ing);
          tag.classList.remove('active');
        } else {
          selectedIngredients.push(ing);
          tag.classList.add('active');
        }

        renderActiveFilters();
        filterRecipes();
      });
    });
  };

  // Show active ingredient filters as removable badges
  const renderActiveFilters = () => {
    if (!activeFiltersEl) return;

    if (selectedIngredients.length === 0) {
      activeFiltersEl.innerHTML = '';
      return;
    }

    activeFiltersEl.innerHTML = selectedIngredients
      .map(ing => `
        <span class="active-filter" data-ingredient="${ing}">
          ${ing} <span class="remove-filter">×</span>
        </span>
      `).join('');

    activeFiltersEl.querySelectorAll('.remove-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const ing = btn.closest('.active-filter').dataset.ingredient;
        selectedIngredients = selectedIngredients.filter(s => s !== ing);

        const tag = ingredientTagsEl?.querySelector(`[data-ingredient="${ing}"]`);
        if (tag) tag.classList.remove('active');

        renderActiveFilters();
        filterRecipes();
      });
    });
  };

  // Apply text search + ingredient filter, re-render grid
  const filterRecipes = () => {
    let filtered = recipes;

    if (searchQuery) {
      filtered = filtered.filter(r => {
        const searchable = [r.title, r.alt, ...r.ingredients].join(' ');
        return fuzzyMatch(searchQuery, searchable);
      });
    }

    if (selectedIngredients.length > 0) {
      filtered = filtered.filter(r => {
        const recipeIngs = r.ingredients.map(i => i.toLowerCase());
        return selectedIngredients.every(sel =>
          recipeIngs.some(ing => ing.includes(sel))
        );
      });
    }

    renderCards(allGrid, filtered);

    if (recipeCountEl) {
      recipeCountEl.textContent =
        `${filtered.length} recipe${filtered.length !== 1 ? 's' : ''} found`;
    }
  };

  const initRecipesPage = () => {
    const ingredients = extractIngredients();
    renderIngredientTags(ingredients);

    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = searchInput.value.trim();
          filterRecipes();
        }, 150);
      });
    }

    filterRecipes();
  };

  // ============================================
  //  LOAD & INIT
  // ============================================
  const loadRecipes = async () => {
    try {
      const res = await fetch('data/recipes.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      recipes = await res.json();

      if (homeGrid) initHomepage();
      if (allGrid) initRecipesPage();
      checkUrlHash();
    } catch (err) {
      console.error('Failed to load recipes:', err);
      const grid = homeGrid || allGrid;
      if (grid) {
        grid.innerHTML = `
          <p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:60px 0;">
            Unable to load recipes. Please try again later.
          </p>`;
      }
    }
  };

  loadRecipes();

});
