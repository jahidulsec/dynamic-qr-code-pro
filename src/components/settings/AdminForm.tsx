import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Admin } from "@prisma/client";
import { addAdmin, updateAdmin } from "@/app/actions/admin";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { useFormState, useFormStatus } from "react-dom";

interface AdminFormProps {
  admin?: Admin;
  onClose: () => void;
}

export default function AdminForm({ admin, onClose }: AdminFormProps) {
  const [data, action] = useFormState(
    admin == null ? addAdmin : updateAdmin.bind(null, admin.id),
    null
  );

  //   const [role, setRole] = useState("admin")

  useEffect(() => {
    if (data?.toast != null) {
      toast.error(data.toast);
    } else if (data?.success) {
      toast.success(data.success);
      onClose();
    }
  }, [data]);

  return (
    <form action={action} className="flex flex-col gap-5 mt-5 px-1">
      <p className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          defaultValue={admin != null ? (admin.username as string) : ""}
        />
        {data?.error != null && data?.error.username && (
          <span className="error-msg">{data.error.username}</span>
        )}
      </p>
      <p className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={admin != null ? (admin.name as string) : ""}
        />
        {data?.error != null && data?.error.name && (
          <span className="error-msg">{data.error.name}</span>
        )}
      </p>
      <p className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          defaultValue={admin != null ? (admin.password as string) : ""}
        />
        {data?.error != null && data?.error.password && (
          <span className="error-msg">{data.error.password}</span>
        )}
      </p>
      <p className="flex flex-col gap-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue="admin">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {data?.error != null && data?.error.role && (
          <p className="error-msg">{data.error.role}</p>
        )}
        {/* <input type="hidden" name="role" value={role} /> */}
      </p>

      <SubmitButton />
    </form>
  );
}

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="col-span-2" type="submit" disabled={pending}>
      {pending ? `Saving...` : `Save`}
    </Button>
  );
};
