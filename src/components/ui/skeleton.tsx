import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

export const TableSkeleton = () => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5rem]">
              <div className="h-5 bg-gray-200 animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-5 bg-gray-200 animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-5 bg-gray-200 animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-5 bg-gray-200 animate-pulse"></div>
            </TableHead>
            <TableHead className="w-[10rem]">
              <div className="h-5 bg-gray-200 animate-pulse"></div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="h-5 bg-gray-100 animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 bg-gray-100 animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 bg-gray-100 animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 bg-gray-100 animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-5 bg-gray-100 animate-pulse"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};


