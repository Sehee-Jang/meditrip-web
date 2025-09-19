import { BellIcon, UserCircleIcon } from "lucide-react";
import { DatePicker } from "../ui/date-picker";

export default function Topbar() {
  return (
    <header className='flex items-center justify-between bg-background px-6 py-3 border-b'>
      <DatePicker />
      <div className='flex items-center space-x-4'>
        <BellIcon className='w-6 h-6 text-muted-foreground' />
        <UserCircleIcon className='w-8 h-8 text-muted-foreground' />
      </div>
    </header>
  );
}
