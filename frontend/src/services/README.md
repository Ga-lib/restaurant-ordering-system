# src/services/

Functions that call the Django backend API, e.g.:
- menuService.js    -> get menu items, categories
- orderService.js   -> place order, get order status
- tableService.js   -> get table status, reserve table
- paymentService.js -> initiate payment, get payment status
- reportService.js  -> fetch AI reports (admin only)

Keeping all API calls here (instead of scattered in components) makes it
easy to change the backend URL or add error handling in one place.
