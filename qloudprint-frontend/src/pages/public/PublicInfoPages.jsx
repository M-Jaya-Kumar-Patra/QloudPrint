import { Link } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    HelpCircle,
    Mail,
    MapPin,
    Phone,
    Printer
} from "lucide-react";
import ThemeToggle from "../../components/common/ThemeToggle";

const contact = {
    email: "qloudprint@gmail.com",
    phone: "7847911696",
    address: "New Burupada, Hinjilicut, PIN: 761102, Odisha, India"
};

export const policyLinks = [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Pricing", to: "/pricing" },
    { label: "FAQ", to: "/faq" },
    { label: "Terms", to: "/terms-and-conditions" },
    { label: "Privacy", to: "/privacy-policy" },
    { label: "Refunds", to: "/refund-cancellation-policy" },
    { label: "Pickup Policy", to: "/pickup-policy" },
    { label: "Sitemap", to: "/sitemap" }
];

const PublicPageShell = ({ eyebrow, title, description, children }) => (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <header className="border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 sm:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 dark:bg-white dark:text-slate-950">
                        <Printer size={22} />
                    </div>
                    <div>
                        <p className="text-xl font-black tracking-tight">QloudPrint</p>
                        <p className="-mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-500">Marketplace</p>
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link to="/login" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:border-white/15 dark:hover:bg-white/10">
                        Login
                    </Link>
                    <Link to="/register" className="hidden rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300 sm:inline-flex">
                        Get Started
                    </Link>
                </div>
            </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300">
                <ArrowLeft size={16} />
                Back to home
            </Link>

            <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8 lg:p-10">
                <p className="text-sm font-black uppercase tracking-[0.26em] text-cyan-600 dark:text-cyan-300">{eyebrow}</p>
                <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">{description}</p>
            </section>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">{children}</div>
                <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-lg font-black">QloudPrint Support</h2>
                    <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                        <ContactLine icon={<Mail size={18} />} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
                        <ContactLine icon={<Phone size={18} />} label="Phone" value={contact.phone} href={`tel:${contact.phone}`} />
                        <ContactLine icon={<MapPin size={18} />} label="Address" value={contact.address} />
                    </div>
                    <div className="mt-6 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold leading-6 text-cyan-950 dark:bg-cyan-400/10 dark:text-cyan-100">
                        Customers upload documents, choose a nearby print shop, pay online, and collect printed orders using QR verification.
                    </div>
                </aside>
            </div>
        </main>

        <PublicFooter />
    </div>
);

const Section = ({ title, children }) => (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-black">{title}</h2>
        <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</div>
    </section>
);

const List = ({ items }) => (
    <ul className="space-y-2">
        {items.map((item) => (
            <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-300" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const ContactLine = ({ icon, label, value, href }) => {
    const content = (
        <div className="flex gap-3">
            <span className="mt-1 text-cyan-600 dark:text-cyan-300">{icon}</span>
            <span>
                <span className="block font-black text-slate-950 dark:text-white">{label}</span>
                <span className="leading-6">{value}</span>
            </span>
        </div>
    );

    return href ? <a href={href} className="block hover:text-cyan-700 dark:hover:text-cyan-200">{content}</a> : content;
};

export const PublicFooter = () => (
    <footer className="border-t border-slate-200 bg-white px-5 py-8 text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-white sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1fr_2fr]">
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 dark:bg-white dark:text-slate-950">
                        <Printer size={20} />
                    </div>
                    <span className="text-xl font-black">QloudPrint</span>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                    A print-order marketplace for document upload, vendor selection, online payment, and shop pickup.
                </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                {policyLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="text-sm font-bold text-slate-600 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-200">
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    </footer>
);

export const AboutUs = () => (
    <PublicPageShell
        eyebrow="About Us"
        title="A smarter way to order printing from nearby shops."
        description="QloudPrint connects customers with local print shops so document printing can be compared, paid for, tracked, and collected with better clarity."
    >
        <Section title="Who We Are">
            <p>
                QloudPrint is a local print-order marketplace built for customers, students, offices, and shopkeepers. Customers can upload print-ready documents, compare nearby shops, choose services such as binding, make online payments, and collect their order from the selected shop.
            </p>
        </Section>
        <Section title="What We Provide">
            <List
                items={[
                    "Document upload and order placement for print jobs.",
                    "Nearby shop discovery using shop-entered or GPS-based location.",
                    "Transparent price estimate before payment.",
                    "QR or order-code based pickup confirmation.",
                    "Order history, invoice download, ratings, and customer support."
                ]}
            />
        </Section>
        <Section title="Business Information">
            <p>Business name: QloudPrint</p>
            <p>Email: {contact.email}</p>
            <p>Phone: {contact.phone}</p>
            <p>Address: {contact.address}</p>
        </Section>
    </PublicPageShell>
);

export const ContactUs = () => (
    <PublicPageShell
        eyebrow="Contact Us"
        title="We are here to help with orders, payments, refunds, and shop onboarding."
        description="For any support request, please contact QloudPrint using the official details below."
    >
        <Section title="Customer Support">
            <p>Email: <a className="font-bold text-cyan-700 dark:text-cyan-300" href={`mailto:${contact.email}`}>{contact.email}</a></p>
            <p>Phone: <a className="font-bold text-cyan-700 dark:text-cyan-300" href={`tel:${contact.phone}`}>{contact.phone}</a></p>
            <p>Address: {contact.address}</p>
        </Section>
        <Section title="Support Hours">
            <p>Support is generally available from 10:00 AM to 7:00 PM IST on working days. Urgent payment or refund issues can be sent by email anytime, and we will respond as soon as possible.</p>
        </Section>
        <Section title="When Contacting Us">
            <List
                items={[
                    "Share your registered phone number or email address.",
                    "Mention the order ID if your query is related to an order.",
                    "For payment issues, share the payment time and amount without sharing card, UPI PIN, OTP, or password details."
                ]}
            />
        </Section>
    </PublicPageShell>
);

export const TermsConditions = () => (
    <PublicPageShell
        eyebrow="Terms & Conditions"
        title="Terms for using QloudPrint."
        description="These terms explain how customers, shopkeepers, and QloudPrint use the platform for document printing and pickup orders."
    >
        <Section title="Use of Platform">
            <p>By using QloudPrint, you agree to provide accurate account, order, document, location, and payment information. You must not upload unlawful, harmful, copyrighted, or restricted content for printing.</p>
        </Section>
        <Section title="Orders and Pricing">
            <p>Order pricing depends on selected shop rates, pages, copies, color mode, paper type, binding, and other services. The final payable amount is shown before payment. Shops are responsible for completing accepted print orders as per the selected specifications.</p>
        </Section>
        <Section title="Pickup Verification">
            <p>Completed orders are verified using a QR code or order code. Customers should collect orders from the selected shop during shop working hours and verify the printed output at pickup.</p>
        </Section>
        <Section title="Account Responsibilities">
            <List
                items={[
                    "Customers and shopkeepers must keep login credentials secure.",
                    "Shopkeepers must keep pricing, location, services, bank details, and availability updated.",
                    "QloudPrint may suspend accounts involved in fraud, misuse, fake orders, or policy violations."
                ]}
            />
        </Section>
        <Section title="Limitation of Liability">
            <p>QloudPrint acts as a technology platform connecting customers and print shops. We work to support order completion, payment tracking, cancellations, and refunds, but we are not responsible for losses caused by incorrect files, incorrect order details, customer delay, shop delay, or events outside reasonable control.</p>
        </Section>
    </PublicPageShell>
);

export const PrivacyPolicy = () => (
    <PublicPageShell
        eyebrow="Privacy Policy"
        title="How QloudPrint collects and protects user information."
        description="This policy explains what information is collected when customers and shopkeepers use QloudPrint."
    >
        <Section title="Information We Collect">
            <List
                items={[
                    "Name, email address, phone number, role, and login information.",
                    "Shop profile details, location, services, binding photos, pricing, and bank details where required for payouts.",
                    "Uploaded documents, order specifications, invoices, ratings, support messages, and payment status.",
                    "Device, browser, and session details required for security and performance."
                ]}
            />
        </Section>
        <Section title="How We Use Information">
            <p>We use information to create accounts, process orders, show nearby shops, calculate prices, manage payments and refunds, generate invoices, support payouts, prevent fraud, and improve the platform.</p>
        </Section>
        <Section title="Payments">
            <p>QloudPrint does not store card numbers, UPI PINs, net banking passwords, or payment OTPs. Payment processing is handled through authorized payment gateway services.</p>
        </Section>
        <Section title="Data Sharing">
            <p>Order details and uploaded documents are shared with the selected shop only for completing the print order. Data may also be shared with payment, hosting, email, analytics, compliance, or legal service providers where necessary.</p>
        </Section>
        <Section title="Data Retention and Deletion">
            <p>We keep account, order, invoice, payment, and support records as required for service, legal, tax, security, and dispute purposes. Unverified or inactive registrations may be deleted after a reasonable period.</p>
        </Section>
    </PublicPageShell>
);

export const RefundCancellationPolicy = () => (
    <PublicPageShell
        eyebrow="Refund & Cancellation"
        title="Clear cancellation and refund rules for print orders."
        description="This policy explains when an order can be cancelled and when a refund can be issued."
    >
        <Section title="Customer Cancellation">
            <p>Customers can cancel an order before the selected shop starts printing. Once printing has started, cancellation may not be available because the shop has already used paper, ink, binding material, and time.</p>
        </Section>
        <Section title="Shop Cancellation">
            <p>If a shop cannot complete an order because of file issues, machine issues, stock unavailability, closing time, or any other operational reason, the shop may cancel the order and the eligible amount will be refunded to the customer.</p>
        </Section>
        <Section title="Refund Eligibility">
            <List
                items={[
                    "Payment succeeded but the order was not accepted or could not be completed.",
                    "Customer cancelled before printing started.",
                    "Shopkeeper cancelled the order before completion.",
                    "Duplicate payment or payment mismatch confirmed by QloudPrint or the payment provider."
                ]}
            />
        </Section>
        <Section title="Refund Timeline">
            <p>Approved refunds are initiated to the original payment method. Bank or payment-provider processing may usually take 5 to 7 business days, or as per the payment provider's timeline.</p>
        </Section>
        <Section title="Non-Refundable Cases">
            <p>Orders may not be refundable after successful printing, after pickup confirmation, or when the uploaded file or selected print settings were incorrect due to customer input.</p>
        </Section>
    </PublicPageShell>
);

export const PickupPolicy = () => (
    <PublicPageShell
        eyebrow="Pickup Policy"
        title="QloudPrint orders are collected from the selected print shop."
        description="QloudPrint currently supports shop pickup for completed print orders. We do not provide courier shipping by default."
    >
        <Section title="Order Pickup">
            <p>After placing an order, customers must visit the selected shop to collect the printed documents. Pickup is verified using the QR code or the QloudPrint order code shown in the customer account.</p>
        </Section>
        <Section title="No Default Shipping">
            <p>QloudPrint does not currently offer default home delivery or courier shipping. If a shop separately offers delivery, it is managed by that shop and should be confirmed directly before placing the order.</p>
        </Section>
        <Section title="Customer Responsibility">
            <List
                items={[
                    "Choose the correct shop before payment.",
                    "Check shop distance, waiting time, working status, and service availability.",
                    "Carry the QR code or order code while collecting the order.",
                    "Verify printed pages at pickup before leaving the shop."
                ]}
            />
        </Section>
    </PublicPageShell>
);

export const PricingPolicy = () => (
    <PublicPageShell
        eyebrow="Pricing"
        title="Pricing is shown before the customer pays."
        description="QloudPrint calculates order estimates using the selected shop's pricing and the customer's print settings."
    >
        <Section title="How Pricing Works">
            <p>Prices may vary by shop, paper size, number of pages, copies, color or black-and-white printing, single-side or double-side printing, binding, laminating, and other services.</p>
        </Section>
        <Section title="Platform Fee">
            <p>QloudPrint may charge a platform fee or convenience fee where applicable. Any such fee is included in the order summary before payment.</p>
        </Section>
        <Section title="Taxes and Charges">
            <p>Applicable taxes, payment gateway charges, or shop service charges may be included as per the final order summary. Customers should review the total amount before confirming payment.</p>
        </Section>
    </PublicPageShell>
);

export const FAQ = () => (
    <PublicPageShell
        eyebrow="FAQ"
        title="Frequently asked questions."
        description="Quick answers for customers and shopkeepers using QloudPrint."
    >
        <Section title="Can I upload PDFs for printing?">
            <p>Yes. Customers can upload documents, choose print settings, compare shops, and place orders online.</p>
        </Section>
        <Section title="Where do I collect my order?">
            <p>You collect the order from the shop selected during checkout. QloudPrint shows shop details and pickup verification in the customer account.</p>
        </Section>
        <Section title="Can I cancel an order?">
            <p>Yes, cancellation is allowed before printing starts. After printing starts, cancellation may not be available.</p>
        </Section>
        <Section title="How will refunds be sent?">
            <p>Eligible refunds are sent back to the original payment method through the payment gateway or banking channel.</p>
        </Section>
        <Section title="How can a shop join QloudPrint?">
            <p>Shopkeepers can register, add shop details, location, services, pricing, binding options, photos, and payout information.</p>
        </Section>
    </PublicPageShell>
);

export const Sitemap = () => (
    <PublicPageShell
        eyebrow="Sitemap"
        title="QloudPrint site map."
        description="Important public and account pages available on QloudPrint."
    >
        <Section title="Public Pages">
            <div className="grid gap-3 sm:grid-cols-2">
                {policyLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 font-bold hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:hover:text-cyan-200">
                        <HelpCircle size={16} />
                        {link.label}
                    </Link>
                ))}
            </div>
        </Section>
        <Section title="Account Pages">
            <List
                items={[
                    "Customer dashboard, upload order, order history, and account profile.",
                    "Shopkeeper dashboard, queue, QR scan, and shop profile.",
                    "Admin analytics and platform settings."
                ]}
            />
        </Section>
    </PublicPageShell>
);

export default AboutUs;
