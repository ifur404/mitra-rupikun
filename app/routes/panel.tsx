import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { allowAny } from "~/lib/auth.server";
import { Smartphone, Wifi, Zap, Gamepad2, Shield, Wallet, SendHorizontal, CreditCard, Droplets, Link, Coins, Banknote, Phone, Car, Grid, Home, List, User } from 'lucide-react'
import { useLoaderData } from "@remix-run/react";


export async function loader(req: LoaderFunctionArgs) {
  const user = allowAny(req)
  return user
}

const services = [
  { icon: Smartphone, label: "Pulsa", badge: "" },
  { icon: Wifi, label: "Paket Data", badge: "" },
  { icon: Zap, label: "PLN", badge: "" },
]
const menu = [
  { icon: Home, label: "Home" },
  { icon: List, label: "Transaksi" },
  { icon: User, label: "Akun" },
  // { icon: Gamepad2, label: "Game", badge: "POPULER" },
  // { icon: Shield, label: "BPJS", badge: "" },
  // { icon: Wallet, label: "GoPay/DANA", badge: "POPULER" },
  // { icon: SendHorizontal, label: "Kirim Uang", badge: "BARU" },
  // { icon: CreditCard, label: "Angsuran Kredit", badge: "LENGKAP" },
  // { icon: Droplets, label: "PDAM", badge: "LENGKAP" },
  // { icon: Link, label: "Top Up LinkAja", badge: "BARU" },
  // { icon: Coins, label: "Top Up DANA", badge: "" },
  // { icon: Banknote, label: "E-money", badge: "POPULER" },
  // { icon: Phone, label: "Telkom", badge: "" },
  // { icon: Car, label: "E-Samsat", badge: "" },
  // { icon: Grid, label: "Semua Kategori", badge: "" }
]

export default function PanelLayout() {
  const user = useLoaderData<typeof loader>()

  return (
    <div className="max-w-md mx-auto min-h-screen p-4 relative">

      <div>
        Halo {user.name}
      </div>
      <div className="grid grid-cols-2 mt-4 px-4">
        <div>
          <div className="text-2xl font-bold">Rp. 10000</div>
          <p className="text-xs">Saldo</p>
        </div>
      </div>

      <div className="grid grid-cols-grid grid-cols-3 gap-4 w-full mt-4 border rounded-lg p-4">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                {service.badge && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs text-white bg-red-500 rounded-full">
                    {service.badge}
                  </span>
                )}
              </div>
              <span className="text-sm text-center">{service.label}</span>
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-0 left-0 w-full">
        <div className="grid grid-cols-3 gap-4 px-4 py-2 border rounded-lg">
        {menu.map((m, index) => {
          const Icon = m.icon
          return (
            <div key={index} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <span className="text-xs text-center">{m.label}</span>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

