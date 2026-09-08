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

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu when overlay is clicked
    navOverlay.addEventListener('click', closeMenu);

    // Close menu on Escape key
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
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target + suffix;
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

  // ---- Recipe Data ----
  const recipes = [
    {
      emoji: '🥗',
      title: 'Quinoa Power Bowl',
      alt: 'fried rice',
      macros: { Protein: '18g', Carbs: '42g', Fat: '12g', Fiber: '6g' },
      kcal: 284,
      micros: { 'Vitamin A': '12%', 'Vitamin C': '34%', 'Iron': '18%', 'Calcium': '8%', 'Potassium': '15%' },
      ingredients: ['Organic quinoa', 'Bell peppers', 'Zucchini', 'Cherry tomatoes', 'Avocado', 'Tahini', 'Lemon juice', 'Fresh parsley'],
      steps: [
        'Rinse quinoa and cook in salted water for 15 minutes until fluffy. Let it cool slightly.',
        'Dice bell peppers, zucchini, and cherry tomatoes. Toss with olive oil, salt, and pepper.',
        'Roast the vegetables at 200°C (400°F) for 20 minutes until edges are golden.',
        'Whisk tahini with lemon juice, a splash of water, salt, and a pinch of garlic powder.',
        'Slice avocado and prepare fresh parsley.',
        'Assemble the bowl: quinoa base, roasted vegetables, avocado slices, drizzle with tahini dressing, and garnish with parsley.'
      ]
    },
    {
      emoji: '🥑',
      title: 'Avocado Toast Deluxe',
      alt: 'cream cheese bagels',
      macros: { Protein: '14g', Carbs: '32g', Fat: '22g', Fiber: '8g' },
      kcal: 340,
      micros: { 'Vitamin K': '26%', 'Vitamin C': '18%', 'Folate': '22%', 'Magnesium': '12%', 'Potassium': '18%' },
      ingredients: ['Sourdough bread', 'Ripe avocado', 'Free-range eggs', 'Microgreens', 'Chili flakes', 'Extra virgin olive oil', 'Flaky sea salt', 'Lemon'],
      steps: [
        'Toast two thick slices of sourdough until golden and crispy.',
        'Halve the avocado, remove the pit, and scoop into a bowl. Mash with a fork, leaving it slightly chunky.',
        'Season the avocado with a squeeze of lemon, sea salt, and a drizzle of olive oil.',
        'Poach eggs in simmering water with a splash of vinegar for 3 minutes until whites are set.',
        'Spread the mashed avocado generously on each toast.',
        'Top with poached eggs, a handful of microgreens, chili flakes, and a final pinch of flaky salt.'
      ]
    },
    {
      emoji: '🍲',
      title: 'Golden Turmeric Soup',
      alt: 'cream-based soups',
      macros: { Protein: '10g', Carbs: '28g', Fat: '14g', Fiber: '5g' },
      kcal: 220,
      micros: { 'Vitamin A': '35%', 'Vitamin C': '20%', 'Iron': '15%', 'Manganese': '22%', 'Zinc': '10%' },
      ingredients: ['Coconut milk', 'Fresh turmeric root', 'Sweet potato', 'Chickpeas', 'Ginger', 'Garlic', 'Vegetable broth', 'Fresh cilantro'],
      steps: [
        'Peel and dice sweet potato into small cubes. Mince ginger and garlic.',
        'Heat olive oil in a pot over medium heat. Sauté garlic and ginger for 1 minute until fragrant.',
        'Add diced sweet potato and grated turmeric. Stir for 2 minutes.',
        'Pour in vegetable broth and coconut milk. Bring to a boil, then reduce to a simmer.',
        'Cook for 20 minutes until sweet potato is tender. Add drained chickpeas in the last 5 minutes.',
        'Blend half the soup for a creamy texture, stir back in, and serve topped with roasted chickpeas and fresh cilantro.'
      ]
    },
    {
      emoji: '🌯',
      title: 'Mediterranean Wrap',
      alt: 'fast-food burritos',
      macros: { Protein: '16g', Carbs: '38g', Fat: '14g', Fiber: '7g' },
      kcal: 310,
      micros: { 'Vitamin A': '18%', 'Vitamin C': '24%', 'Iron': '20%', 'Calcium': '12%', 'Folate': '16%' },
      ingredients: ['Whole wheat tortilla', 'Homemade hummus', 'Baked falafel', 'Cucumber', 'Tomato', 'Red onion', 'Tzatziki sauce', 'Mixed greens'],
      steps: [
        'Prepare falafel by blending chickpeas, herbs, garlic, and spices. Form into small patties and bake at 190°C (375°F) for 25 minutes.',
        'Dice cucumber, tomato, and thinly slice red onion.',
        'Make tzatziki by mixing Greek yogurt with grated cucumber, garlic, lemon juice, and dill.',
        'Warm the whole wheat tortilla in a dry pan for 30 seconds on each side.',
        'Spread a generous layer of hummus down the center of the tortilla.',
        'Layer falafel, diced vegetables, mixed greens, and drizzle with tzatziki. Roll tightly, tucking in the sides.'
      ]
    },
    {
      emoji: '🍣',
      title: 'Poke Bowl',
      alt: 'mayo-heavy sushi rolls',
      macros: { Protein: '24g', Carbs: '36g', Fat: '10g', Fiber: '4g' },
      kcal: 320,
      micros: { 'Omega-3': '45%', 'Vitamin D': '22%', 'Vitamin B12': '38%', 'Selenium': '28%', 'Iodine': '20%' },
      ingredients: ['Sushi-grade salmon', 'Short-grain brown rice', 'Edamame', 'Cucumber', 'Mango', 'Sesame seeds', 'Ginger', 'Low-sodium soy sauce'],
      steps: [
        'Cook brown rice according to package instructions. Season with a splash of rice vinegar and let cool.',
        'Dice sushi-grade salmon into bite-sized cubes. Toss with low-sodium soy sauce and a drizzle of sesame oil.',
        'Shell edamame, slice cucumber into thin rounds, and dice mango.',
        'Thinly slice fresh ginger and soak in rice vinegar with a pinch of sugar for 10 minutes.',
        'Assemble the bowl: rice base, arranged sections of salmon, edamame, cucumber, and mango.',
        'Top with sesame seeds, pickled ginger, and serve with extra soy sauce on the side.'
      ]
    },
    {
      emoji: '🫐',
      title: 'Açaí Bliss Bowl',
      alt: 'ice cream & sugary cereal',
      macros: { Protein: '6g', Carbs: '48g', Fat: '8g', Fiber: '10g' },
      kcal: 260,
      micros: { 'Vitamin C': '42%', 'Vitamin A': '15%', 'Antioxidants': '65%', 'Iron': '10%', 'Calcium': '8%' },
      ingredients: ['Frozen açaí puree', 'Banana', 'Mixed berries', 'Granola', 'Coconut flakes', 'Raw honey', 'Chia seeds', 'Almond butter'],
      steps: [
        'Blend frozen açaí packets with half a banana and a splash of almond milk until thick and smooth.',
        'Pour the açaí base into a bowl.',
        'Slice the remaining banana. Wash and prepare fresh berries.',
        'Arrange toppings in sections: sliced banana, mixed berries, a handful of granola, and coconut flakes.',
        'Drizzle with raw honey and a spoonful of almond butter.',
        'Sprinkle chia seeds on top and serve immediately before it melts.'
      ]
    }
  ];

  // ---- Recipe Modal ----
  const modalOverlay = document.getElementById('recipeModal');
  const modal = modalOverlay?.querySelector('.recipe-modal');
  const modalClose = modalOverlay?.querySelector('.recipe-modal-close');

  const openRecipeModal = (index) => {
    const recipe = recipes[index];
    if (!recipe || !modalOverlay) return;

    modal.querySelector('.recipe-modal-emoji').textContent = recipe.emoji;
    modal.querySelector('.recipe-modal-title').textContent = recipe.title;
    modal.querySelector('.recipe-modal-alt').innerHTML =
      `Healthy alternative to <strong>${recipe.alt}</strong>`;

    const macroList = modal.querySelector('.recipe-modal-macros ul');
    macroList.innerHTML = Object.entries(recipe.macros)
      .map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`)
      .join('');

    const microList = modal.querySelector('.recipe-modal-micros ul');
    microList.innerHTML = Object.entries(recipe.micros)
      .map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`)
      .join('');

    modal.querySelector('.recipe-modal-kcal').textContent = `${recipe.kcal} kcal per serving`;

    const ingredientList = modal.querySelector('.recipe-modal-ingredients ul');
    ingredientList.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join('');

    const stepList = modal.querySelector('.recipe-modal-steps ol');
    stepList.innerHTML = recipe.steps.map(s => `<li>${s}</li>`).join('');

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeRecipeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.recipe-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const index = parseInt(card.dataset.recipe, 10);
      openRecipeModal(index);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeRecipeModal);
  }

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

});
