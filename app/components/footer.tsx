
export default function Footer() {
  return  <footer className="bg-gray-800 text-white p-4 mt-8">
  <div className="container mx-auto text-center">
      <p>&copy; {new Date().getFullYear()} PBO. All rights reserved.</p>
      <p className="mt-2">
          <a href="/privacy" className="hover:underline mr-4">Privacy Policy</a>
          <a href="/terms" className="hover:underline">Terms of Service</a>
      </p>
  </div>
</footer>
}
