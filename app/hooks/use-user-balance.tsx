import { useEffect, useState } from "react";

export default function useUserBalance(user_id:number) {
    const [saldo, setSaldo] = useState(0);

    async function getSaldo() {
      try {
        const response = await fetch(`/api/saldo/?key=${user_id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch saldo for user ${user_id}`);
        }
        const data = await response.json() as {saldo:number};
        setSaldo(data?.saldo ?? 0);
      } catch (err: any) {
        setSaldo(0); // fallback
      } 
    }
    useEffect(() => {
      if (!user_id) return;
  
      getSaldo()
    }, [user_id]);
  
    return {
      saldo,
      getSaldo,
    };
}
