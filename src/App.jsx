import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import api from "./api/axios";
import ScrollToTop from "./components/ScrollToTop";

// Import Layouts
import PublicLayout from "./layouts/PublicLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import AboutUs from "./layouts/AboutUs";
import FAQ from "./layouts/FAQ";

// Import Pages Public
import Home from "./pages/public/Home";
import ProductDetail from "./pages/public/ProductDetail";
import Products from "./pages/public/Products";
import HomeCus from "./pages/customer/HomeCus";
import Login from "./pages/public/auth/Login";
import Register from "./pages/public/auth/Register";
// Untuk customer
import Cart from "./pages/customer/Cart";
import Profile from "./pages/customer/Profile";
import GoogleCallback from "./pages/public/auth/GoogleCallback";
import Checkout from "./pages/customer/Checkout";
import OrderList from "./pages/customer/OrderList";
import OrderDetail from "./pages/customer/OrderDetail";
import Detail from "./pages/customer/Detail";
import Katalog from "./pages/customer/Katalog";

// Konfigurasi Axios
axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers.Accept = "application/json";
  return config;
});

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* RUTE PUBLIK */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} /> {/* Akses publik */}
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/About" element={<AboutUs />} />
          <Route path="/FAQ" element={<FAQ />} />
        </Route>

        {/* RUTE CUSTOMER */}
        <Route element={<CustomerLayout />}>
          <Route path="/Home" element={<HomeCus />} /> {/* Akses customer */}
          <Route path="/AboutOurCompany" element={<AboutUs />} />
          <Route path="/FAQs" element={<FAQ />} />
          <Route path="/detail/:slug" element={<Detail />} />
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order/:id" element={<OrderDetail />} />
        </Route>

        {/* Halaman 404 */}
        <Route
          path="*"
          element={
            <div className="flex justify-center items-center h-screen">
              404 - Halaman Tidak Ditemukan
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
