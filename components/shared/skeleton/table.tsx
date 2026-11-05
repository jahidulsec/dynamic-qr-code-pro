import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TableSkeleton = () => {
  return (
    <div className="my-3 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-20">
              <div className="h-5 animate-pulse bg-gray-200"></div>
            </TableHead>
            <TableHead className="min-w-20">
              <div className="h-5 animate-pulse bg-gray-200"></div>
            </TableHead>
            <TableHead className="min-w-20">
              <div className="h-5 animate-pulse bg-gray-200"></div>
            </TableHead>
            <TableHead className="min-w-20">
              <div className="h-5 animate-pulse bg-gray-200"></div>
            </TableHead>
            <TableHead className="w-40">
              <div className="h-5 animate-pulse bg-gray-200"></div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="h-5 animate-pulse bg-gray-100"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 animate-pulse bg-gray-100"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 animate-pulse bg-gray-100"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 animate-pulse bg-gray-100"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 animate-pulse bg-gray-100"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export { TableSkeleton };
