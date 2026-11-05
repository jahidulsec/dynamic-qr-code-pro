import { IconLoader } from "@tabler/icons-react";

const SectionLoader = () => {
  return (
    <div className="flex min-h-40 w-full items-center justify-center">
      <IconLoader className="text-primary size-8 animate-spin" />
    </div>
  );
};

export { SectionLoader };
