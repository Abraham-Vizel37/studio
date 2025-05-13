export function Footer() {
  return (
    <footer className="py-6 px-4 md:px-6 border-t mt-auto">
      <div className="container mx-auto text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} FrameMapper. All rights reserved.
      </div>
    </footer>
  );
}
