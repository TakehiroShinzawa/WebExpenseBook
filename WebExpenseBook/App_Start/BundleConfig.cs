using System.Web;
using System.Web.Optimization;

namespace WebExpenseBook
{
    public class BundleConfig
    {
        // バンドルの詳細については、https://go.microsoft.com/fwlink/?LinkId=301862 を参照してください
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // 開発と学習には、Modernizr の開発バージョンを使用します。次に、実稼働の準備が
            // 運用の準備が完了したら、https://modernizr.com のビルド ツールを使用し、必要なテストのみを選択します。
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.bundle.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/myIncome").Include(
                      "~/Scripts/library.js",
                      "~/Scripts/Income.js"));
            bundles.Add(new ScriptBundle("~/bundles/myPayment").Include(
                      "~/Scripts/library.js",
                      "~/Scripts/Payment.js"));
            bundles.Add(new ScriptBundle("~/bundles/myChat").Include(
                      "~/Scripts/chat.js",
                      "~/Scripts/MyChat.js"));
            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/style.css",
                      "~/Content/site.css"));
        }
    }
}
