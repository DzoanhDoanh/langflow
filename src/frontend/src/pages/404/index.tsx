import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-foreground">
          Trang không tìm thấy
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
          >
            Quay lại
          </Button>

        </div>
      </div>
    </div>
  );
}
