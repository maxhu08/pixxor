"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { ChevronDown, LogOut, SquareLibrary, User, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FC } from "react";

interface UserActionsDropdownProps {
  username: string;
}

export const UserActionsDropdown: FC<UserActionsDropdownProps> = ({ username }) => {
  const dialog = useDialogStore();

  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="cursor-pointer">
          <User />
          {username}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/gallery" className="flex w-full cursor-pointer items-center gap-2">
            <SquareLibrary size={16} />
            <span>Gallery</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 text-red-500"
          onClick={() => dialog.open("sign-out")}
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
