import crypto from 'node:crypto';

export class Digiflazz {
    url: string;
    username: string;
    apikey: string;

    constructor(username: string, apikey: string) {
        this.url = 'https://digi.rupikun.com/v1/'
        this.username = username
        this.apikey = apikey
    }

    generateMD5(input: string) {
        return crypto.createHash('md5').update(input).digest('hex');
    }

    getSign(cmd: string) {
        return this.generateMD5(`${this.username}${this.apikey}${cmd}`)
    }

    async getSaldo(): Promise<number> {
        const req = await fetch(this.url + "cek-saldo", {
            method: "POST",
            body: JSON.stringify({
                sign: this.getSign("depo"),
                cmd: "deposit",
                username: this.username
            }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await req.json() as { data: { deposit: number } }
        if (!(process.env.NODE_ENV === 'production')) {
            console.log(data)
        }
        return data.data.deposit
    }

    async priceList({ category }: { category: DigiCategory }) {
        const req = await fetch(this.url + "price-list", {
            method: "POST",
            body: JSON.stringify({
                sign: this.getSign("pricelist"),
                cmd: "prepaid",
                category,
                username: this.username
            }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await req.json() as { data: TPriceList[] }
        // if(!this.isProd){
        //     console.log(data)
        // }
        return data.data
    }

    async postRequest(body: object) {
        const req = await fetch(this.url + "transaction", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await req.json() as { data: TResponseTransaction }
        return data.data
    }
    

    async processTransactionPulsa({
        sku,
        customer_no,
        webhook_url,
        isProd=false,
    }:{
        sku:string;
        customer_no: string;
        webhook_url: string;
        isProd: boolean
    }){
        const ref_id = crypto.randomUUID()
        let payload: TRequestTransaction = {
            username: this.username,
            buyer_sku_code: sku,
            customer_no: customer_no,
            ref_id,
            sign: this.getSign(ref_id),
            cb_url: webhook_url
        }
        if (!isProd) {
            payload = { ...payload, testing: true, customer_no: "087800001233", buyer_sku_code: "xld10" }
        }
        const response = await this.postRequest(payload)
        return response
    }
}

export type TPriceList = {
    product_name: string
    category: string
    brand: string
    type: string
    seller_name: string
    price: number
    buyer_sku_code: string
    buyer_product_status: boolean
    seller_product_status: boolean
    unlimited_stock: boolean
    stock: number
    multi: boolean
    start_cut_off: string
    end_cut_off: string
    desc: string
}

export type TRequestTransaction = {
    username: string; // Username yang telah diatur di pengaturan koneksi API
    buyer_sku_code: string; // Kode produk Anda
    customer_no: string; // Nomor Pelanggan
    ref_id: string; // Ref ID unik Anda
    sign: string; // Signature dengan formula md5(username + apiKey + ref_id)
    testing?: boolean; // Value true apabila ingin melakukan development
    max_price?: number; // Limit Harga Max
    cb_url?: string; // Callback URL
    allow_dot?: boolean; // Value true apabila ingin Parameter customer_no berisi titik
}

export type TDataProvider = {
    from: "digiflazz"
    digiflazz?: TPriceList,
}

export type TResponseTransaction = {
    ref_id: string; // Ref ID Unik Anda
    customer_no: string; // Nomor pelanggan
    buyer_sku_code: string; // Kode produk Anda
    message: string; // Deskripsi Status Transaksi
    status: 'Sukses' | 'Pending' | 'Gagal'; // Status transaksi
    rc: string; // Response Code
    sn?: string; // Serial Number (Opsional)
    buyer_last_saldo?: number; // Saldo terakhir Anda setelah transaksi terjadi (Opsional)
    price: number; // Harga Produk
    tele?: string; // Telegram Seller (Opsional)
    wa?: string; // Whatsapp Seller (Opsional)
}

export const CHOICE_STATUS = [
    { value: 0, label: 'Sukses' },
    { value: 1, label: 'Pending' },
    { value: 3, label: 'Gagal' },
    { value: 4, label: 'Problem' },
];


export type TWebhookData = {
  trx_id: string;
  ref_id: string;
  customer_no: string;
  buyer_sku_code: string;
  message: string;
  status: string;
  rc: string;
  buyer_last_saldo: number;
  sn: string;
  price: number;
  tele: string;
  wa: string;
}

export type DigiCategory = "Pulsa" | "Data" | "Games"