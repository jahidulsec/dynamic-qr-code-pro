'use client';

import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next-nprogress-bar';
import { range } from '@/lib/utils';

function PagePagination({ limit, count }: { limit: number; count: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params = new URLSearchParams(searchParams);

  const noOfPages = Math.ceil(count / limit);
  const currentPage = Number(searchParams.get('p')) || 1;

  let pageStart = currentPage <= 4 ? 2 : currentPage - 2;
  let pageStop = currentPage >= noOfPages - 2 ? noOfPages - 1 : currentPage + 2;

  return (
    <Pagination>
      <PaginationContent className="flex justify-between w-full">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              let value = Number(searchParams.get('p')) || 1;
              if (value > 1) {
                value -= 1;
                params.set('p', value.toString());
                params.toString();
                router.push(pathname + '?' + params.toString());
              }
            }}
          />
        </PaginationItem>

        <div className="hidden sm:flex gap-1">
          <PaginationItem>
            <PaginationLink
              isActive={currentPage === 1}
              onClick={() => {
                params.set('p', '1');
                params.toString();
                router.push(pathname + '?' + params.toString());
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>

          {currentPage > 4 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {range(pageStart, pageStop).map((item, index) => (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={Number(searchParams.get('p') || 1) === item}
                onClick={() => {
                  let value = item;
                  params.set('p', value.toString());
                  params.toString();
                  router.push(pathname + '?' + params.toString());
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ))}

          {currentPage < noOfPages - 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {noOfPages > 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => {
                  params.set('p', noOfPages.toString());
                  params.toString();
                  router.push(pathname + '?' + params.toString());
                }}
              >
                {noOfPages}
              </PaginationLink>
            </PaginationItem>
          )}
        </div>

        <PaginationItem>
          <PaginationNext
            onClick={() => {
              let value = Number(searchParams.get('p')) || 1;
              if (value < noOfPages) {
                value += 1;
                params.set('p', value.toString());
                params.toString();
                router.push(pathname + '?' + params.toString());
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PagePagination;
