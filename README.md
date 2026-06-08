# QloudPrint

QloudPrint is a full-stack web application for online print ordering. Customers can upload PDF documents, compare nearby print shops, pay online, track orders, download documents and invoices, and use QR codes for pickup. Shopkeepers can manage their shop profile, services, pricing, binding options, queue, and order status in real time.

## Features

- Customer and shopkeeper authentication with JWT
- Customer PDF upload and document preview
- Nearby print shop recommendations based on distance, price, wait time, and ratings
- Multi-file print orders with copies, paper size, color, side, binding, and instructions
- Cashfree payment order creation and verification
- Order creation only after successful payment verification
- Customer dashboard with order tracking, document download, and PDF invoice download
- Shopkeeper dashboard with live order updates and status control
- Optimized active queue that removes completed/cancelled orders
- QR code generation and QR pickup verification
- Shop profile management with pricing, availability, payout details, and binding photos
- Admin analytics dashboard
- Light/dark theme support
- Responsive UI for desktop, tablet, and mobile screens

## Tech Stack

**Frontend**

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Recharts
- STOMP/SockJS WebSocket client
- React QR Code

**Backend**

- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- MySQL
- WebSocket
- Cloudinary
- Cashfree Payment Gateway
- Apache PDFBox
- Docker

## Project Structure

```text
QloudPrint/
|-- qloudprint-frontend/      # React frontend
|-- qloudprint-backend/       # Spring Boot backend
|-- public/                   # Root-level static assets
|-- src/                      # Older/root frontend files
`-- README.md
```

The active frontend app is inside `qloudprint-frontend`. The backend app is inside `qloudprint-backend`.

## Prerequisites

Install these before running the project locally:

- Node.js 20 or newer
- Java 21
- Maven
- MySQL
- Cloudinary account
- Cashfree sandbox/production account

## Backend Setup

Go to the backend folder:

```bash
cd qloudprint-backend
```

Create environment variables for the backend:

```env
DB_URL=jdbc:mysql://localhost:3306/qloudprint
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
CASHFREE_ENV=sandbox
CASHFREE_PAYOUT_CLIENT_ID=your_cashfree_payout_client_id
CASHFREE_PAYOUT_CLIENT_SECRET=your_cashfree_payout_client_secret
CASHFREE_PAYOUT_ENV=sandbox
PLATFORM_FEE_PERCENT=10

GMAIL_SMTP_USERNAME=your_gmail_address@gmail.com
GMAIL_SMTP_APP_PASSWORD=your_16_character_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

## Frontend Setup

Go to the frontend folder:

```bash
cd qloudprint-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_BASE_URL=http://localhost:8080
```

Run the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Main Routes

```text
/                           Public home page
/login                      Login
/register                   Register
/customer/dashboard         Customer dashboard
/customer/orders            Customer orders and invoices
/upload                     Upload and place print order
/shopkeeper/dashboard       Shopkeeper dashboard
/shopkeeper/profile         Shop settings
/shopkeeper/optimized-queue Optimized print queue
/shopkeeper/scan-qr         QR pickup scanner
/admin/analytics            Admin dashboard
```

## Build Commands

Frontend production build:

```bash
cd qloudprint-frontend
npm run build
```

Backend package build:

```bash
cd qloudprint-backend
./mvnw -DskipTests package
```

On Windows:

```bash
mvnw.cmd -DskipTests package
```

## Docker Backend Deployment

The backend includes a Dockerfile:

```text
qloudprint-backend/Dockerfile
```

Build locally:

```bash
cd qloudprint-backend
docker build -t qloudprint-backend .
```

Run locally:

```bash
docker run -p 8080:8080 --env-file .env qloudprint-backend
```

## Render Backend Deployment

For deploying the backend on Render with Docker, use these settings:

```text
Root Directory:
qloudprint-backend

Dockerfile Path:
qloudprint-backend/Dockerfile

Docker Build Context Directory:
qloudprint-backend

Docker Command:
leave empty

Pre-Deploy Command:
leave empty
```

Add the backend environment variables in Render:

```env
DB_URL=your_render_or_external_mysql_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
<<<<<<< HEAD
=======
CASHFREE_ENV=production
CASHFREE_PAYOUT_CLIENT_ID=your_cashfree_payout_client_id
CASHFREE_PAYOUT_CLIENT_SECRET=your_cashfree_payout_client_secret
CASHFREE_PAYOUT_ENV=production
PLATFORM_FEE_PERCENT=10
GMAIL_SMTP_USERNAME=your_gmail_address@gmail.com
GMAIL_SMTP_APP_PASSWORD=your_16_character_gmail_app_password
FRONTEND_URL=https://your-frontend-domain.com
>>>>>>> 9b6b822 (secure application properties)
```

If deploying the frontend separately, set:

```env
VITE_BASE_URL=https://your-backend-service.onrender.com
```

## Payment Flow

1. Customer uploads one or more PDFs.
2. Customer selects print options and a shop.
3. Backend creates a Cashfree payment order.
4. Customer completes payment.
5. Backend verifies the payment status with Cashfree.
6. Print orders are created only when payment is verified as paid.
7. Shopkeeper receives the order in the dashboard and queue.

## Queue Logic

The optimized queue only shows active orders. Completed and cancelled orders are removed from the active queue. Active jobs are sorted to reduce average waiting time by prioritizing shorter estimated print jobs first, with priority score used as a tie-breaker.

## Notes

- Make sure MySQL is running before starting the backend locally.
- Do not commit real API keys, database passwords, or payment secrets to GitHub.
- Use Cashfree sandbox credentials during development.
- The frontend expects `VITE_BASE_URL` to point to the backend base URL, without `/api` at the end.

## Author

Developed by **M Jaya Kumar Patra**.
