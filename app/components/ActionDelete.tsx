import { useFetcher } from "@remix-run/react"
import { ReactNode, useState } from "react"
import { Button } from "./ui/button"
import { DialogHeader, DialogFooter, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog"
import MyTooltip from "./MyTooltip";

export function ActionDelete({ id, children }: { id: any; children: ReactNode }) {
  const [show, setShow] = useState(false)
  const fetcher = useFetcher({ key: "DELETE" })
  function toggleShow() {
    setShow(cur => !cur)
  }

  return <Dialog onOpenChange={toggleShow} open={show}>
    <DialogTrigger asChild>
      <span>
        <MyTooltip title="Hapus">
          {children}
        </MyTooltip>
      </span>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Apakah kamu yakin?</DialogTitle>
        <DialogDescription>
          Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus akun Anda dan menghapus data Anda dari server kami.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={toggleShow}>Batal</Button>
        <Button variant="destructive" onClick={() => {
          const formData = new FormData()
          formData.append("id", id)
          formData.append("intent", "DELETE")
          fetcher.submit(formData, { method: "POST" })
          toggleShow()
        }} disabled={fetcher.state === "submitting"}>Lanjutkan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}