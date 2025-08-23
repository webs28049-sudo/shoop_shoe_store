(function () {
    "use strict";
  
    // ---------- Helpers ----------
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  
    const throttle = (fn, wait = 100) => {
      let last = 0;
      return (...args) => {
        const now = Date.now();
        if (now - last >= wait) {
          last = now;
          fn(...args);
        }
      };
    };
  
    const scrollWithOffset = (target) => {
      const nav = $("section nav");
      const navH = nav ? nav.offsetHeight : 0;
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - (navH + 12); // small spacing
      window.scrollTo({ top, behavior: "smooth" });
    };
  
    // ---------- Fixed data ----------
    const SECTION_IDS = ["Home", "Products", "About", "Review", "Servises"];
  
    // ---------- Active link highlighting ----------
    function setupActiveNav() {
      const navLinks = $$("section nav ul li a");
      const sections = SECTION_IDS
        .map((id) => document.getElementById(id))
        .filter(Boolean);
  
      const highlight = throttle(() => {
        const fromTop = window.scrollY + ( $("section nav")?.offsetHeight || 0 ) + 40;
        let current = sections[0];
        for (const s of sections) {
          if (s.offsetTop <= fromTop) current = s;
        }
        navLinks.forEach((a) => a.classList.remove("active"));
        const active = navLinks.find((a) => a.getAttribute("href") === `#${current.id}`);
        active && active.classList.add("active");
      }, 150);
  
      on(window, "scroll", highlight);
      on(window, "load", highlight);
  
      // Minimal style if .active not defined in CSS
      const style = document.createElement("style");
      style.textContent = `section nav ul li a.active{ color:#c72092; text-decoration:underline; }`;
      document.head.appendChild(style);
    }
  
    // ---------- Smooth scroll with offset for nav links ----------
    function setupSmartScroll() {
      $$("section nav ul li a").forEach((a) => {
        on(a, "click", (e) => {
          const hash = a.getAttribute("href");
          if (!hash?.startsWith("#")) return;
          const target = document.querySelector(hash);
          if (!target) return;
          e.preventDefault();
          scrollWithOffset(target);
          history.pushState(null, "", hash);
        });
      });
  
      // "SHOP NOW" -> Products
      const shopBtn = $("section .main .button a");
      if (shopBtn) {
        on(shopBtn, "click", (e) => {
          e.preventDefault();
          const products = document.getElementById("Products");
          products && scrollWithOffset(products);
        });
      }
    }
  
    // ---------- Cart badge + product actions ----------
    function setupProducts() {
      const state = { count: 0, items: [] };
      // create badge on cart icon
      const cartIcon = $('section nav .icons .fa-cart-shopping');
      if (cartIcon) {
        const badge = document.createElement("span");
        badge.className = "cart-badge";
        badge.textContent = "0";
        badge.setAttribute("aria-label", "Cart items");
        cartIcon.style.position = "relative";
        Object.assign(badge.style, {
          position: "absolute",
          top: "-8px",
          right: "-10px",
          minWidth: "18px",
          height: "18px",
          padding: "0 4px",
          borderRadius: "10px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "#fff",
          background: "linear-gradient(to right,#c72092,#6c14d0)",
        });
        cartIcon.parentElement?.appendChild(badge);
  
        const updateBadge = () => (badge.textContent = String(state.count));
  
        // Add to cart buttons
        $$(".products .card").forEach((card) => {
          const addBtn = $(".products_text .btn", card);
          const title = $(".products_text h2", card)?.textContent?.trim() || "Item";
          const priceText = $(".products_text h3", card)?.textContent || "$0";
          const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;
          const img = $(".image img", card)?.getAttribute("src") || "";
  
          // Like (heart) toggle
          const heart = $(".small_card .fa-heart", card);
          if (heart) {
            on(heart, "click", () => {
              heart.classList.toggle("liked");
              heart.style.color = heart.classList.contains("liked") ? "#c72092" : "";
              heart.style.transform = "scale(1.1)";
              setTimeout(() => (heart.style.transform = ""), 120);
            });
          }
  
          // Share
          const share = $(".small_card .fa-share", card);
          if (share) {
            on(share, "click", async () => {
              const shareData = {
                title: `${title} - $${price}`,
                text: `Check out this ${title} for $${price}`,
                url: location.href,
              };
              try {
                if (navigator.share) {
                  await navigator.share(shareData);
                } else {
                  await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                  toast("Copied product info to clipboard");
                }
              } catch (_) {
                toast("Could not share");
              }
            });
          }
  
          if (addBtn) {
            on(addBtn, "click", (e) => {
              e.preventDefault();
              state.items.push({ title, price, img, qty: 1 });
              state.count += 1;
              updateBadge();
              toast(`Added to cart: ${title}`);
            });
          }
        });
      }
    }
  
    // ---------- About section gallery (replace inline onclick) ----------
    function setupAboutGallery() {
      const mainImg = $("#imagebox");
      if (!mainImg) return;
      $$(".about_small_image img").forEach((thumb) => {
        on(thumb, "click", () => {
          mainImg.src = thumb.src;
          mainImg.style.transform = "scale(0.98)";
          setTimeout(() => (mainImg.style.transform = ""), 120);
        });
      });
    }
  
    
    // ---------- Login form ----------
function setupLoginForm() {
    const form = document.querySelector(".login_form form");
    if (!form) return;
  
    form.addEventListener("submit", (e) => {
      const name = form.querySelector('input[name="name"]')?.value.trim();
      const phone = form.querySelector('input[name="phone"]')?.value.trim();
      const address = form.querySelector('input[name="address"]')?.value.trim();
      const message = form.querySelector('textarea[name="message"]')?.value.trim();
  
      if (!name) {
        e.preventDefault();
        toast("Please enter your name");
        return;
      }
      if (!phone) {
        e.preventDefault();
        toast("Please enter your phone");
        return;
      }
      if (!address) {
        e.preventDefault();
        toast("Please enter your address");
        return;
      }
      if (!message) {
        e.preventDefault();
        toast("Please enter your message");
        return;
      }
  
      // Demo confirmation
      toast('Thank you ${name}, your form has been submitted!');
    });
  }
    // ---------- Newsletter subscribe ----------
    function setupNewsletter() {
      const wrap = $("footer .search_bar");
      if (!wrap) return;
      const input = $("input", wrap);
      const btn = $("button", wrap);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      on(btn, "click", (e) => {
        e.preventDefault();
        const value = input?.value?.trim() || "";
        if (!emailRegex.test(value)) {
          toast("Please enter a valid email");
          return;
        }
        toast("Subscribed! 🎉");
        input.value = "";
      });
    }
  
    // ---------- Tiny toast system ----------
    function toast(msg = "", ms = 2000) {
      let host = $("#toast-host");
      if (!host) {
        host = document.createElement("div");
        host.id = "toast-host";
        Object.assign(host.style, {
          position: "fixed",
          zIndex: 9999,
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
        });
        document.body.appendChild(host);
      }
      const t = document.createElement("div");
      t.role = "status";
      t.textContent = msg;
      Object.assign(t.style, {
        padding: "10px 14px",
        borderRadius: "20px",
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        fontSize: "14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        pointerEvents: "auto",
      });
      host.appendChild(t);
      setTimeout(() => t.remove(), ms);
    }
  
    // ---------- Init ----------
    function init() {
      setupActiveNav();
      setupSmartScroll();
      setupProducts();
      setupAboutGallery();
      setupLoginForm();
      setupNewsletter();
    }
  
    // Defer until DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
  