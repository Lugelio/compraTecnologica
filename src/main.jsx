import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './main/App.jsx'
import MainLayout from './mainLayout.jsx';
import Profile from './profile/Profile.jsx';
import Car from './car/Car.jsx';
import Login from './login/Login.jsx';
import Register from './login/register.jsx';
import LogoutUser from './login/logout.jsx';
import Admin from './database/adminBase/admin.jsx';
import ProductDetail from './productCard/productDetail.jsx';


import './index.css'

const router = createBrowserRouter([
 {
    path: "/",
    element: <MainLayout/>,
    children: [
      { index: true, element: <App /> }, // ruta "/"
      { path: "profile", element: <Profile /> },
      { path: "car", element: <Car /> },
      { path: "login", element: <Login /> },
      { path: "producto/:id", element: <ProductDetail /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "logout", element: <LogoutUser /> },
    ],
  },
])
createRoot(document.getElementById('root')).render(
  <>
    <RouterProvider router={router}/>
  </>,
)
