import { Link } from "@remix-run/react";

export default function Header() {
    return <nav className="bg-gray-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
                Mitra
            </Link>
            {/* <ul className="flex space-x-4">
                <li><Link to="/" className="hover:underline">Home</Link></li>
                <li><Link to="/about" className="hover:underline">About</Link></li>
                <li><Link to="/services" className="hover:underline">Services</Link></li>
                <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul> */}
        </div>
    </nav>
}
