import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/datatable";
import { formatCurrency } from "~/components/InputCurrency";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { TPriceList } from "~/lib/digiflazz";
import sessionCookie, { TAuth } from "~/lib/auth.server";
import { getListDB } from "~/lib/ledger.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Jualan Pulsa" },
    { name: "description", content: "Jual pulsa murah dan gampang hanya di mitra.rupikun.com" },
  ];
};

export async function loader(req: LoaderFunctionArgs) {
  const session = sessionCookie(req.context.cloudflare.env)
  const user: TAuth | undefined = await session.parse(req.request.headers.get("Cookie"))
  if(user && user?.is_staff) throw redirect('/dashboard')
  if(user && user?.id) throw redirect('/panel')
  const product = await getListDB(req.context.cloudflare.env)
  return product
}


const collums: ColumnDef<TPriceList>[] = [
  {
    id: "id",
    accessorKey: 'code',
    header: "ID"
  },
  {
    id: "name",
    accessorKey: 'product_name',
    header: "Product"
  },
  {
    id: "price_sell",
    accessorFn: (d) => formatCurrency(d?.price?.toString() || "0"),
    header: "Harga"
  },
]

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Price />
        <CTA />
      </main>
      <Footer />
    </div>

  );
}


function CTA() {
  return (
    <section id="cta" className="py-20 bg-primary text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Siap Memulai Bisnis Pulsa Anda?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Daftar sekarang dan dapatkan bonus saldo Rp 50.000 untuk memulai bisnis Anda!
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link to="/login">Daftar Gratis</Link>
        </Button>
      </div>
    </section>
  )
}

function Price() {
  const loadData = useLoaderData<typeof loader>()

  return (
    <section id="price" className="py-20 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Harga</h2>
        <DataTable columns={collums} data={loadData || []} />
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja</h2>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
          <div className="text-center">
            <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4 mx-auto">1</div>
            <h3 className="text-xl font-semibold mb-2">Daftar</h3>
            <p className="text-gray-600">Buat akun gratis di platform kami</p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4 mx-auto">2</div>
            <h3 className="text-xl font-semibold mb-2">Deposit</h3>
            <p className="text-gray-600">Isi saldo akun Anda</p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4 mx-auto">3</div>
            <h3 className="text-xl font-semibold mb-2">Jual</h3>
            <p className="text-gray-600">Mulai jual pulsa dan produk digital</p>
          </div>
        </div>
      </div>
    </section>
  )
}




function Header() {
  return (
    <header className="py-4 px-6 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          JualanPulsa
        </Link>
        <nav className="hidden md:flex space-x-4 items-center">
          <Link to="#features" className="text-gray-600 hover:text-primary">
            Fitur
          </Link>
          <Link to="#how-it-works" className="text-gray-600 hover:text-primary">
            Cara Kerja
          </Link>
          <Link to="#price" className="text-gray-600 hover:text-primary">
            Harga
          </Link>
          <Button asChild>
            <Link to="/login">Mulai Sekarang</Link>
          </Button>
        </nav>
        {/* <Button className="md:hidden" variant="outline" size="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
          <span className="sr-only">Menu</span>
        </Button> */}
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-80 text-white">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Jual Pulsa dengan Mudah dan Menguntungkan
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Mulai bisnis pulsa Anda hari ini. Dapatkan keuntungan maksimal dengan platform terpercaya.
        </p>
        <Button asChild size="lg">
          <Link to="/login">Daftar Sekarang</Link>
        </Button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-200 py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <Link to="/" className="text-2xl font-bold">
            JualanPulsa
          </Link>
          <p className="text-sm mt-2">© 2023 JualanPulsa. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end space-x-4">
          <Link to="/tentang-kami" className="hover:text-primary">
            Tentang Kami
          </Link>
          <Link to="/syarat-dan-ketentuan" className="hover:text-primary">
            Syarat dan Ketentuan
          </Link>
          <Link to="/kebijakan-privasi" className="hover:text-primary">
            Kebijakan Privasi
          </Link>
          <Link to="https://wa.me/6282122012959" className="hover:text-primary">
            Kontak
          </Link>
        </nav>
      </div>
    </footer>
  )
}


const features = [
  {
    title: "Harga Kompetitif",
    description: "Dapatkan harga pulsa terbaik untuk meningkatkan keuntungan Anda."
  },
  {
    title: "Transaksi Cepat",
    description: "Proses pengisian pulsa instan untuk kepuasan pelanggan Anda."
  },
  {
    title: "Dukungan 24/7",
    description: "Tim support kami siap membantu Anda kapan saja."
  },
  {
    title: "Beragam Produk",
    description: "Jual pulsa, paket data, token listrik, dan produk digital lainnya."
  }
]

function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

