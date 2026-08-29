# shop/

The seller UI is part of the unified Vite app at **`/shop`**.

Source lives in [`../src/shop/`](../src/shop/). This folder is not a second Vite app — do not start a seller server on port 5174.

```bash
cd .. && npm install && npm run icons && npm run dev
```

Then open `http://localhost:5173/shop` (Today · Stock · Orders · Shop). Same API as the buyer app via `/api`.
