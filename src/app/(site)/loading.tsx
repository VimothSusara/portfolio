import { PageLoader } from "@/components/shared/page-loader";

export default function SiteLoading() {
  return <PageLoader label="Loading page..." />;
}

// export default function SiteLoading() {
//   return (
//     <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
//       <div className="flex gap-2">
//         {[0, 1, 2].map((i) => (
//           <span
//             key={i}
//             className="size-2.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none"
//             style={{ animationDelay: `${i * 150}ms` }}
//           />
//         ))}
//       </div>
//       <p className="text-sm text-muted-foreground">Loading...</p>
//     </div>
//   );
// }