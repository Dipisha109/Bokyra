# BOKYRA — Technical & Architecture Guide
**Internship Project Documentation**  
*Stack: React 18, React Router v6, Vite, Vanilla CSS*

---

## 1. Project Overview & Hierarchy

The application follows an atelier-luxury bag e-commerce model structured as follows:

```text
                  BOKYRA (Root App)
                          │
          ┌───────────────┴───────────────┐
       [Navbar]                       [Footer]
          │                               │
   ┌──────┴───────────────────────────────┴──────┐
   │                                             │
[Home Page]                                 [Auth Flow]
 ├─ Hero                                     ├─ Register (localStorage save)
 ├─ ShopByPurpose                            └─ Login (session authentication)
 ├─ FeaturedSilhouettes                          │
 ├─ AdvisoryBanner                               ▼
 └─ MakeItYours                           [Navbar User Pill]
        │
   ┌────┴─────────────────────────────┐
   ▼                                  ▼
[Shop Collection]              [Find My Bag Quiz]
 ├─ Category Filters (.filter())     ├─ 4-Step Questionnaire
 └─ ProductCard (wishlist state)     └─ Curated Matches
        │
        ▼
[Product Details (/shop/:id)]
 ├─ Dynamic Route Matching (useParams)
 ├─ Quantity Selector (useState)
 └─ Local Cart & Wishlist Trigger
```

---

## 2. Key React & Web Concepts Learned

### A. Dynamic Routing (`react-router-dom`)
* **`BrowserRouter`, `Routes`, `Route`**: Manages client-side page transitions without full page reloads.
* **`useParams()`**: Extracts parameters from the URL path.
  * *Example in [ProductDetails.jsx](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/pages/ProductDetails.jsx)*:  
    Route is `/shop/:id`. Visiting `/shop/1` provides `id = "1"`.
* **`useNavigate()`**: Programmatically redirects users (e.g. redirecting to Home `/` after successful registration).

### B. State Management (`useState`)
* **Controlled Forms ([Register.jsx](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/pages/Register.jsx), [Login.jsx](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/pages/Login.jsx))**:  
  React holds current input values in state (`formData`). Every keystroke updates state via `onChange`.
* **Step Progression ([FindMyBag.jsx](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/pages/FindMyBag.jsx))**:  
  State `step` advances from `0` to `3` to determine which question renders.
* **Component-Level Toggles ([ProductCard.jsx](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/components/ProductCard.jsx))**:  
  Each card tracks whether it has been wishlisted (`isWishlisted`).

### C. Side Effects & Lifecycle (`useEffect`)
* **Synchronization ([Navbar.jsx](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/components/Navbar.jsx))**:  
  `useEffect` runs on component mount to retrieve saved user data from browser storage and attaches an event listener to respond whenever authentication state updates.

### D. Client-Side Persistence (`localStorage`)
* Browser storage is used to simulate authentication without requiring a backend server:
  * `localStorage.setItem('bokyra_registered_user', ...)` saves profile credentials.
  * `localStorage.getItem('bokyra_logged_user')` verifies and restores active sessions.
  * `localStorage.removeItem(...)` executes logout.

---

## 3. Directory & File Breakdown

| File / Component | Purpose | Core Concepts |
| :--- | :--- | :--- |
| **`src/App.jsx`** | Central application router wrapping [Navbar](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/components/Navbar.jsx) and [Footer](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/components/Footer.jsx). | Router configuration, global layout wrapper. |
| **`src/pages/Home.jsx`** | Full atelier landing page assembling all core brand sections. | Component composition. |
| **`src/components/Hero.jsx`** | Editorial 2-column header with product highlights. | Semantic layout, typography hierarchy. |
| **`src/components/ShopByPurpose.jsx`** | Visual intent directory (Work, College, Everyday, Travel). | Array `.map()` iteration over categories. |
| **`src/components/FeaturedSilhouettes.jsx`** | Curated catalog showcase utilizing reusable cards. | Prop passing into [ProductCard](file:///d:/Documents/Internship/Bag-Ecommerce/Bokyra/src/components/ProductCard.jsx). |
| **`src/components/AdvisoryBanner.jsx`** | Dynamic Fit Engine banner linking to the quiz. | Promotional CTA routing. |
| **`src/components/MakeItYours.jsx`** | Atelier bespoke custom craftsmanship preview. | Split media editorial grid. |
| **`src/components/Footer.jsx`** | Global multi-column site footer with brand story and links. | Structural layout, navigation links. |
| **`src/pages/Shop.jsx`** | Filterable catalog. | Filtering lists using `.filter()`. |
| **`src/pages/ProductDetails.jsx`** | Full product view with interactive quantity and bag addition. | `useParams()`, array `.find()`. |
| **`src/pages/Customize.jsx`** | Atelier bespoke customizer studio with swatches and live price calculation. | Dynamic state derivation, interactive form controls. |
| **`src/pages/Register.jsx`** | Account creation form storing credentials in `localStorage`. | Form validation, controlled inputs. |
| **`src/pages/Login.jsx`** | Sign-in form validating against stored credentials. | Authentication simulation, state sync. |
| **`src/index.css`** | Unified design tokens, responsive breakpoints, typography. | CSS custom properties, grid/flexbox. |

