import { Link, useRouteLoaderData } from "@remix-run/react"
import {loader} from './panel'
import { ChevronLeft, Smartphone, Wifi, Zap } from 'lucide-react'

const services = [
  { icon: Smartphone, label: "Pulsa", badge: "" },
  { icon: Wifi, label: "Paket Data", badge: "" },
  { icon: Zap, label: "PLN", badge: "" },
]

export default function panelindex() {
  const user = useRouteLoaderData<typeof loader>("routes/panel")
  if(!user) return null

  return (
    <>
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

    </>
  )
}


export function HeaderBack({title}:{title: string}){
  return <div className="flex items-center gap-4 px-4 py-2 rounded-lg border ">
    <Link to="/panel" ><ChevronLeft /></Link>
    <div className="text-xl">{title}</div>
  </div>
}