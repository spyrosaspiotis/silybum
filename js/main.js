document.documentElement.classList.add("js");

const i18n = window.SILYBUM_I18N;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const menuLinks = menu ? [...menu.querySelectorAll("a")] : [];
const pageMain = document.querySelector("main");
const pageFooter = document.querySelector("footer");
const headerBrand = document.querySelector(".site-header .brand");
const desktopMenuQuery = window.matchMedia("(min-width: 821px)");
const languageSelector = document.querySelector("[data-language-selector]");
const languageToggle = document.querySelector("[data-language-toggle]");
const languageMenu = document.querySelector("[data-language-menu]");
const languageCurrent = document.querySelector("[data-language-current]");
const languageOptions = [...document.querySelectorAll("[data-language-option]")];
const metaDescription = document.querySelector('meta[name="description"]');
const supportedLanguages = i18n ? Object.keys(i18n.languages) : ["el"];
let currentLanguage = i18n?.defaultLanguage || "el";

function translate(key, language = currentLanguage) {
  const entry = i18n?.text?.[key];
  if (typeof entry === "string") return entry;
  return entry?.[language] ?? entry?.[i18n?.defaultLanguage] ?? key;
}

function getStoredLanguage() {
  try {
    const storedLanguage = window.localStorage.getItem(i18n?.storageKey || "silybum-language");
    return supportedLanguages.includes(storedLanguage) ? storedLanguage : null;
  } catch {
    return null;
  }
}

function storeLanguage(language) {
  try {
    window.localStorage.setItem(i18n?.storageKey || "silybum-language", language);
  } catch {
    // The language still changes for this visit when storage is unavailable.
  }
}

function updateMenuToggleLabel() {
  if (!menuToggle) return;
  const menuIsOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-label", translate(menuIsOpen ? "a11y.closeMenu" : "a11y.openMenu"));
}

function updateLanguageControls() {
  const language = i18n?.languages?.[currentLanguage];
  if (!language) return;

  if (languageCurrent) languageCurrent.textContent = language.code;
  languageToggle?.setAttribute("aria-label", `${translate("language.change")}: ${language.native}`);

  languageOptions.forEach((option) => {
    const isActive = option.dataset.languageOption === currentLanguage;
    option.setAttribute("aria-checked", String(isActive));
    option.classList.toggle("is-active", isActive);
  });
}

function applyLanguage(language, { persist = true } = {}) {
  currentLanguage = supportedLanguages.includes(language) ? language : i18n?.defaultLanguage || "el";
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : currentLanguage;
  document.documentElement.dataset.language = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = translate(element.dataset.i18nHtml);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAria));
  });

  document.title = translate("meta.title");
  metaDescription?.setAttribute("content", translate("meta.description"));
  updateMenuToggleLabel();
  updateLanguageControls();

  const submittedStatus = document.querySelector('[data-form-status][data-submitted="true"]');
  if (submittedStatus) submittedStatus.textContent = translate("form.success");
  if (persist) storeLanguage(currentLanguage);
}

function setLanguageMenu(open, { focus = false, restoreFocus = false } = {}) {
  if (!languageSelector || !languageToggle || !languageMenu) return;

  languageToggle.setAttribute("aria-expanded", String(open));
  languageSelector.classList.toggle("is-open", open);
  languageMenu.hidden = !open;

  if (open && focus) {
    const activeOption = languageOptions.find((option) => option.dataset.languageOption === currentLanguage);
    (activeOption || languageOptions[0])?.focus();
  } else if (!open && restoreFocus) {
    languageToggle.focus();
  }
}

function setPageInert(inert) {
  [pageMain, pageFooter, headerBrand].forEach((element) => {
    if (!element) return;
    element.inert = inert;
    element.toggleAttribute("inert", inert);
  });
}

function setMenu(open, { restoreFocus = true } = {}) {
  if (!menuToggle || !menu) return;

  const wasOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  updateMenuToggleLabel();
  menu.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  setPageInert(open);

  if (!open) setLanguageMenu(false);

  if (open) {
    menuLinks[0]?.focus();
  } else if (wasOpen && restoreFocus && !desktopMenuQuery.matches) {
    menuToggle.focus();
  }
}

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenu(open);
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

languageToggle?.addEventListener("click", () => {
  const open = languageToggle.getAttribute("aria-expanded") !== "true";
  setLanguageMenu(open, { focus: open });
});

languageToggle?.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown") return;
  event.preventDefault();
  setLanguageMenu(true, { focus: true });
});

languageOptions.forEach((option) => {
  option.addEventListener("click", () => {
    applyLanguage(option.dataset.languageOption);
    setLanguageMenu(false, { restoreFocus: true });
  });
});

document.addEventListener("click", (event) => {
  if (languageToggle?.getAttribute("aria-expanded") !== "true") return;
  if (languageSelector?.contains(event.target)) return;
  setLanguageMenu(false);
});

function getMenuFocusableElements() {
  if (!menu) return [];

  return [...menu.querySelectorAll('a, button:not([disabled])')].filter(
    (element) => !element.hidden && !element.closest("[hidden]") && element.offsetParent !== null,
  );
}

document.addEventListener("keydown", (event) => {
  const languageMenuIsOpen = languageToggle?.getAttribute("aria-expanded") === "true";

  if (event.key === "Escape" && languageMenuIsOpen) {
    event.preventDefault();
    setLanguageMenu(false, { restoreFocus: true });
    return;
  }

  const menuIsOpen = menuToggle?.getAttribute("aria-expanded") === "true";
  if (!menuIsOpen) return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenu(false);
    return;
  }

  const menuFocusableElements = getMenuFocusableElements();
  if (event.key !== "Tab" || menuFocusableElements.length === 0) return;

  const firstLink = menuFocusableElements[0];
  const lastLink = menuFocusableElements[menuFocusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstLink) {
    event.preventDefault();
    lastLink.focus();
  } else if (!event.shiftKey && document.activeElement === lastLink) {
    event.preventDefault();
    firstLink.focus();
  }
});

const closeMenuAtDesktop = (event) => {
  if (event.matches) setMenu(false, { restoreFocus: false });
};

desktopMenuQuery.addEventListener?.("change", closeMenuAtDesktop);

window.addEventListener("storage", (event) => {
  if (event.key !== i18n?.storageKey || !supportedLanguages.includes(event.newValue)) return;
  applyLanguage(event.newValue, { persist: false });
});

setLanguageMenu(false);
applyLanguage(getStoredLanguage() || i18n?.defaultLanguage || "el", { persist: false });

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 30);

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const imagePanels = document.querySelectorAll("[data-image]");

function loadPanelImage(panel) {
  const imageUrl = panel.dataset.image;
  if (!imageUrl || panel.dataset.imageLoading === "true") return;

  panel.dataset.imageLoading = "true";

  const image = new Image();
  image.onload = () => {
    panel.style.backgroundImage = `url("${imageUrl}")`;
    panel.classList.add("image-panel--loaded");
  };
  image.onerror = () => {
    delete panel.dataset.imageLoading;
  };
  image.src = imageUrl;
}

const heroImagePanel = document.querySelector(".hero__media[data-image]");
if (heroImagePanel) loadPanelImage(heroImagePanel);

const lazyImagePanels = [...imagePanels].filter((panel) => panel !== heroImagePanel);

if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadPanelImage(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "300px 0px", threshold: 0.01 },
  );

  lazyImagePanels.forEach((panel) => imageObserver.observe(panel));
} else {
  lazyImagePanels.forEach(loadPanelImage);
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const collectionSelect = document.querySelector("[data-collection-select]");
const collectionButtons = document.querySelectorAll("[data-collection]");

collectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!collectionSelect) return;
    collectionSelect.value = button.dataset.collection || "";
  });
});

const eventDate = document.querySelector("#event-date");

if (eventDate) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  eventDate.min = localToday.toISOString().split("T")[0];
}

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (formStatus) {
    formStatus.dataset.submitted = "true";
    formStatus.textContent = translate("form.success");
  }
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
