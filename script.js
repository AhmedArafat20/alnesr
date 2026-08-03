/* =========================================================
   النسر لتوصيل الطلبيات — shared interactions
   ========================================================= */
(function () {
  "use strict";

  var PRIMARY_PHONE_INTL = "971501553080"; // 050 155 3080
  var BACKUP_PHONE_INTL  = "971508681083"; // 0508681083

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderScroll();
    initMobileMenu();
    initTiltCards();
    initHeroEmblem();
    initReveal();
    initMap();
    initWhatsAppForm();
    initFlipTap();
    initYear();
  });

  /* ---------------- Header scroll state ---------------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 30) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    var burger = document.querySelector(".burger");
    var menu = document.querySelector(".mobile-menu");
    if (!burger || !menu) return;
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      menu.classList.toggle("show");
      document.body.style.overflow = menu.classList.contains("show") ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        menu.classList.remove("show");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------- 3D tilt on glass cards ---------------- */
  function initTiltCards() {
    var cards = document.querySelectorAll(".tilt-card");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var ry = (px - 0.5) * 14;
        var rx = (0.5 - py) * 14;
        card.style.setProperty("--rx", rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", ry.toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------------- Hero 3D emblem follows cursor ---------------- */
  function initHeroEmblem() {
    var emblem = document.querySelector(".hero-emblem");
    var wrap = document.querySelector(".hero-emblem-wrap");
    if (!emblem || !wrap) return;
    wrap.addEventListener("mousemove", function (e) {
      var r = wrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var ry = (px - 0.5) * 34;
      var rx = (0.5 - py) * 24;
      emblem.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
    });
    wrap.addEventListener("mouseleave", function () {
      emblem.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ---------------- UAE map tooltips ---------------- */
  function initMap() {
    var mapWrap = document.querySelector(".map-wrap");
    var tooltip = document.querySelector(".map-tooltip");
    if (!mapWrap || !tooltip) return;
    var nodes = mapWrap.querySelectorAll(".node");
    nodes.forEach(function (node) {
      node.addEventListener("mousemove", function (e) {
        var r = mapWrap.getBoundingClientRect();
        var name = node.getAttribute("data-name");
        var time = node.getAttribute("data-time");
        tooltip.innerHTML = "<b>" + name + "</b> — التوصيل خلال " + time;
        tooltip.style.left = (e.clientX - r.left + 18) + "px";
        tooltip.style.top = (e.clientY - r.top - 46) + "px";
        tooltip.classList.add("show");
      });
      node.addEventListener("mouseleave", function () {
        tooltip.classList.remove("show");
      });
      node.addEventListener("click", function () {
        var name = node.getAttribute("data-name");
        var msg = "مرحباً النسر، أريد طلب توصيل من/إلى " + name + ".";
        openWhatsApp(PRIMARY_PHONE_INTL, msg);
      });
    });
  }

  /* ---------------- Flip cards: tap support on touch devices ---------------- */
  function initFlipTap() {
    var flips = document.querySelectorAll(".flip-card");
    flips.forEach(function (card) {
      card.addEventListener("click", function () {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("flipped");
        }
      });
    });
  }

  /* ---------------- WhatsApp helpers ---------------- */
  function openWhatsApp(phone, message) {
    var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
  }
  window.NESR_openWhatsApp = openWhatsApp;
  window.NESR_PRIMARY_PHONE = PRIMARY_PHONE_INTL;
  window.NESR_BACKUP_PHONE = BACKUP_PHONE_INTL;

  /* ---------------- Order form -> WhatsApp message ---------------- */
  function initWhatsAppForm() {
    var form = document.getElementById("orderForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var from = (data.get("from") || "").toString().trim();
      var to = (data.get("to") || "").toString().trim();
      var service = (data.get("service") || "خدمة توصيل").toString();
      var notes = (data.get("notes") || "").toString().trim();

      if (!name || !phone || !from || !to) {
        showFormMsg(form, "من فضلك أكمل الاسم ورقم الهاتف ومكان الاستلام والتسليم.", true);
        return;
      }

      var lines = [
        "مرحباً النسر لتوصيل الطلبيات 🦅",
        "الاسم: " + name,
        "رقم الهاتف: " + phone,
        "نوع الخدمة: " + service,
        "من: " + from,
        "إلى: " + to
      ];
      if (notes) lines.push("ملاحظات: " + notes);

      openWhatsApp(PRIMARY_PHONE_INTL, lines.join("\n"));
      showFormMsg(form, "تم تجهيز طلبك — جارِ فتح واتساب لإرساله الآن.", false);
      form.reset();
    });
  }

  function showFormMsg(form, text, isError) {
    var el = form.querySelector(".form-msg");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-msg";
      form.appendChild(el);
    }
    el.textContent = text;
    el.style.color = isError ? "#e77" : "#9be8b6";
    el.style.marginTop = "14px";
    el.style.fontWeight = "700";
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }
})();
