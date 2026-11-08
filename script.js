// portfolio main script - soham kumar shrivastava
// plain vanilla js + gsap scrolltrigger + lenis smooth scroll

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // quick check so we don't force heavy animations on folks who turned on prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // simple debounce helper so resize events don't murder the browser
  const debounce = (fn, delay = 150) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  // lenis smooth scroll setup
  // note to self: earlier had a stupid bug calling lenis.raf twice per frame (once in raf, once in ticker).
  // that made delta = 0 and completely froze the scrollwheel lol. keeping it to a single clean raf loop now.
  let lenis = null;

  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 1.15,
        touchMultiplier: 1.5,
        smoothWheel: true,
      });

      // tell scrolltrigger whenever lenis scrolls
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', () => {
          ScrollTrigger.update();
        });
      }

      // single raf loop - don't touch this unless you want frozen scrolling again
      function lenisLoop(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisLoop);
      }
      requestAnimationFrame(lenisLoop);
    } catch (err) {
      console.warn('lenis failed to start, falling back to regular scroll:', err);
      lenis = null;
    }
  }

  // register gsap scrolltrigger plugin
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // thin progress bar stuck to the top that fills as you scroll down
  const progressBar = document.querySelector('.scroll-progress');

  if (progressBar && typeof ScrollTrigger !== 'undefined') {
    gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' });

    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.set(progressBar, { scaleX: self.progress });
      },
    });
  }

  // custom mouse cursor dot + trailing ring
  // only enable on desktop mice, touchscreens will just use normal touch
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');

  if (isFinePointer && !prefersReducedMotion && cursor && follower) {
    document.body.classList.add('has-custom-cursor');

    let mouseX = -100;
    let mouseY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.set(cursor, { x: mouseX, y: mouseY });

      // follower circle lags slightly behind with a smooth easing
      gsap.to(follower, {
        x: mouseX,
        y: mouseY,
        duration: 0.18,
        ease: 'power2.out',
      });
    }, { passive: true });

    // scale cursor up when hovering buttons or cards
    const interactiveSelectors = 'a, button, .project-card, .cert-card, .skill-cluster, .timeline__content';
    const interactives = document.querySelectorAll(interactiveSelectors);

    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(cursor, { scale: 1.8, duration: 0.25, ease: 'power2.out' });
        gsap.to(follower, { scale: 1.45, borderColor: '#B86F4B', duration: 0.25, ease: 'power2.out' });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(cursor, { scale: 1, duration: 0.25, ease: 'power2.out' });
        gsap.to(follower, { scale: 1, borderColor: '#B86F4B', duration: 0.25, ease: 'power2.out' });
      });
    });

    // hide custom cursor if user moves mouse out of the browser tab
    document.documentElement.addEventListener('mouseleave', () => {
      gsap.to([cursor, follower], { opacity: 0, duration: 0.2 });
    });

    document.documentElement.addEventListener('mouseenter', () => {
      gsap.to([cursor, follower], { opacity: 1, duration: 0.2 });
    });
  }

  // sticky navbar & mobile drawer menu logic
  const navHeader = document.querySelector('.nav-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileBackdrop = document.querySelector('.mobile-menu-backdrop');
  const allNavAnchors = document.querySelectorAll('.nav-link, .mobile-nav-link, .hero__cta a, .nav-logo');

  // add background blur to navbar once scrolled past 50px
  const handleNavScrollState = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (navHeader) {
      if (scrollY > 50) {
        navHeader.classList.add('scrolled');
      } else {
        navHeader.classList.remove('scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleNavScrollState, { passive: true });
  handleNavScrollState();

  // mobile menu toggle
  if (hamburger && mobileMenu) {
    const toggleMobileMenu = (forceClose = false) => {
      const shouldOpen = forceClose ? false : !mobileMenu.classList.contains('is-open');
      hamburger.classList.toggle('is-active', shouldOpen);
      mobileMenu.classList.toggle('is-open', shouldOpen);
      if (mobileBackdrop) mobileBackdrop.classList.toggle('is-active', shouldOpen);
      document.body.classList.toggle('menu-open', shouldOpen);
      hamburger.setAttribute('aria-expanded', shouldOpen);
      mobileMenu.setAttribute('aria-hidden', !shouldOpen);
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // clicking the blurred backdrop closes the menu
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => toggleMobileMenu(true));
    }

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(true));
    });

    // hitting escape key closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        toggleMobileMenu(true);
      }
    });
  }

  // smooth scrolling when clicking on navbar links
  allNavAnchors.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetEl = document.querySelector(href);
      if (!targetEl) return;

      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(targetEl, { offset: -70, duration: 1.2 });
      } else {
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({
          top: targetPos,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    });
  });

  // active section spy - highlights nav link and switches nav text color
  // so nav stays readable as you scroll between dark green and beige sections
  if (typeof ScrollTrigger !== 'undefined') {
    const sections = document.querySelectorAll('section[id]');

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) {
            const currentId = section.getAttribute('id');

            // highlight active link
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href === `#${currentId}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });

            // swap nav theme for contrast
            const isDark = section.classList.contains('section--dark');
            if (navHeader) {
              if (isDark) {
                navHeader.classList.remove('nav-on-light');
                navHeader.classList.add('nav-on-dark');
              } else {
                navHeader.classList.remove('nav-on-dark');
                navHeader.classList.add('nav-on-light');
              }
            }
          }
        },
      });
    });

    // run once on page load so initial theme is correct even if user refreshed midway
    const checkInitialNavTheme = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      let matchedSection = null;

      sections.forEach((s) => {
        const top = s.offsetTop - 100;
        const bottom = top + s.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          matchedSection = s;
        }
      });

      if (matchedSection && navHeader) {
        const isDark = matchedSection.classList.contains('section--dark');
        navHeader.classList.toggle('nav-on-dark', isDark);
        navHeader.classList.toggle('nav-on-light', !isDark);
      }
    };

    checkInitialNavTheme();
    window.addEventListener('scroll', checkInitialNavTheme, { passive: true });
  }

  // terminal typing effect for the "$ whoami" block
  const terminalCommand = document.querySelector('.terminal__command');
  const terminalOutputText = document.querySelector('.terminal__output-text');
  const cursorCmd = document.querySelector('.terminal__cursor--cmd');
  const cursorOutput = document.querySelector('.terminal__cursor--output');
  const terminalOutput = document.querySelector('.terminal__output');

  // types out text character-by-character with slight random delay so it feels like real typing
  const typeString = (el, text, minDelay = 35, maxDelay = 75) => {
    return new Promise((resolve) => {
      if (prefersReducedMotion) {
        el.textContent = text;
        resolve();
        return;
      }

      let idx = 0;
      el.textContent = '';

      function tick() {
        if (idx < text.length) {
          el.textContent += text.charAt(idx);
          idx++;
          const delay = Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
          setTimeout(tick, delay);
        } else {
          resolve();
        }
      }
      tick();
    });
  };

  if (terminalCommand && terminalOutputText) {
    const fullTagline = terminalOutput.getAttribute('data-text') || terminalOutputText.textContent.trim();

    if (!prefersReducedMotion) {
      terminalCommand.textContent = '';
      terminalOutputText.textContent = '';
      if (cursorOutput) cursorOutput.style.display = 'none';
      if (cursorCmd) cursorCmd.style.display = 'inline-block';

      const executeTerminalSequence = async () => {
        // type "whoami" first
        await typeString(terminalCommand, 'whoami', 50, 95);

        // tiny pause like bash executing the command
        await new Promise((r) => setTimeout(r, 400));

        // switch blinking cursor to output line
        if (cursorCmd) cursorCmd.style.display = 'none';
        if (cursorOutput) cursorOutput.style.display = 'inline-block';

        // type out the tagline
        await typeString(terminalOutputText, fullTagline, 16, 36);
      };

      setTimeout(executeTerminalSequence, 450);
    } else {
      // if reduced motion is turned on, just show full text right away
      terminalCommand.textContent = 'whoami';
      terminalOutputText.textContent = fullTagline;
      if (cursorCmd) cursorCmd.style.display = 'none';
      if (cursorOutput) cursorOutput.style.display = 'inline-block';
    }
  }

  // subtle hero parallax when scrolling down
  if (!prefersReducedMotion && typeof ScrollTrigger !== 'undefined') {
    const heroContent = document.querySelector('.hero__content');
    const heroImage = document.querySelector('.hero__image-frame');
    const heroSection = document.querySelector('.hero');

    if (heroSection) {
      if (heroContent) {
        gsap.to(heroContent, {
          y: -50,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (heroImage) {
        gsap.to(heroImage, {
          y: -25,
          opacity: 0.7,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }
  }

  // split section headings into words and animate them in with a slight stagger
  if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const headings = document.querySelectorAll('.section__heading');

    headings.forEach((heading) => {
      const rawText = heading.textContent.trim();
      const words = rawText.split(/\s+/);

      heading.innerHTML = words
        .map((w) => `<span class="split-word" style="display:inline-block;will-change:transform,opacity;">${w}</span>`)
        .join(' ');

      const splitWords = heading.querySelectorAll('.split-word');

      gsap.from(splitWords, {
        y: 26,
        opacity: 0,
        stagger: 0.05,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 88%',
          once: true,
        },
      });
    });

    const heroName = document.querySelector('.hero__name');
    if (heroName) {
      gsap.from(heroName, {
        y: 35,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: 0.1,
      });
    }
  }

  // animated project tree entrance
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    const treeLine = document.querySelector('.projects__tree-line');
    const projectCards = document.querySelectorAll('.project-card');

    if (treeLine && typeof ScrollTrigger !== 'undefined') {
      gsap.to(treeLine, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: treeLine.closest('.projects__track') || treeLine,
          start: 'top 78%',
          end: 'bottom 82%',
          scrub: 0.7,
        },
      });
    }

    projectCards.forEach((card, i) => {
      gsap.from(card, {
        x: i % 2 === 0 ? -55 : 55,
        y: 18,
        opacity: 0,
        duration: 0.75,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          once: true,
        },
      });
    });
  }

  // timeline vertical line that draws itself down as user scrolls through experience
  if (!prefersReducedMotion && typeof ScrollTrigger !== 'undefined') {
    const timelineLine = document.querySelector('.timeline__line');
    const timeline = document.querySelector('.timeline');

    if (timelineLine && timeline) {
      gsap.set(timelineLine, { scaleY: 0, transformOrigin: 'top center' });

      gsap.to(timelineLine, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.5,
        },
      });
    }

    const timelineEntries = document.querySelectorAll('.timeline__entry');
    timelineEntries.forEach((entry, idx) => {
      gsap.from(entry, {
        x: -28,
        opacity: 0,
        duration: 0.75,
        delay: idx * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: entry,
          start: 'top 85%',
          once: true,
        },
      });
    });
  }

  // fade-and-rise cards for skills, certs, education & contact
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    const skillsTreeLine = document.querySelector('.skills__tree-line');
    // skills clusters
    const skillClusters = document.querySelectorAll('.skill-cluster');

    if (skillsTreeLine && typeof ScrollTrigger !== 'undefined') {
      gsap.to(skillsTreeLine, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: skillsTreeLine.closest('.skills__grid') || skillsTreeLine,
          start: 'top 78%',
          end: 'bottom 82%',
          scrub: 0.7,
        },
      });
    }

    if (skillClusters.length) {
      skillClusters.forEach((cluster, i) => {
        gsap.from(cluster, {
          x: i % 2 === 0 ? -55 : 55,
          y: 18,
          opacity: 0,
          duration: 0.65,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cluster,
            start: 'top 85%',
            once: true,
          },
        });
      });
    }

    // cert cards
    const certCards = document.querySelectorAll('.cert-card');
    if (certCards.length) {
      gsap.from(certCards, {
        y: 30,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: certCards[0].closest('.cert-grid') || certCards[0],
          start: 'top 85%',
          once: true,
        },
      });
    }

    // education card
    const eduCard = document.querySelector('.education__card');
    if (eduCard) {
      gsap.from(eduCard, {
        y: 35,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: eduCard,
          start: 'top 85%',
          once: true,
        },
      });
    }

    // contact items
    const contactItems = document.querySelectorAll('.contact__item');
    if (contactItems.length) {
      gsap.from(contactItems, {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contactItems[0].closest('.contact__grid') || contactItems[0],
          start: 'top 88%',
          once: true,
        },
      });
    }

    // about lead & facts
    const aboutLead = document.querySelector('.about__lead');
    const aboutOpenTo = document.querySelector('.about__open-to');
    const aboutFacts = document.querySelector('.about__facts');

    [aboutLead, aboutOpenTo, aboutFacts].forEach((el, i) => {
      if (el) {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      }
    });
  }

  // magnetic button hover effect (buttons follow cursor slightly when mouse moves over them)
  if (isFinePointer && !prefersReducedMotion && typeof gsap !== 'undefined') {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / 3.8;
        const deltaY = (e.clientY - centerY) / 3.8;

        gsap.to(btn, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1.1, 0.45)',
        });
      });
    });
  }

  // recalculate scrolltrigger positions once web fonts & images finish loading
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  }

  // cleanup triggers if user navigates away
  window.addEventListener('beforeunload', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    }
    if (lenis) {
      lenis.destroy();
    }
  });
});
