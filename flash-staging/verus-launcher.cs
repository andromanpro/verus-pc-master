// Verus PC-Master — резидентный лаунчер в системном трее (WinExe, без консоли).
// Иконка в трее + контекстное меню (Открыть дашборд / Перезапустить / Выключить).
// Стартует dashboard\server.ps1 скрыто; сервер сам открывает браузер.
// Манифест requireAdministrator (см. verus-app.manifest) — один UAC при запуске, полный режим.
// Компилируется встроенным csc.exe (.NET Framework, C# 5) — без сторонних зависимостей.
// ВАЖНО: компилировать с /codepage:65001 — иначе кириллица в меню/тултипе превратится в мусор.
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

// Метаданные exe — видны в Свойствах файла → «Подробно» и в SmartScreen/диспетчере задач.
// Версия (AssemblyVersion/FileVersion/InformationalVersion) НЕ здесь — её запекает build-flash
// отдельным сгенерированным verus-version.cs из файла VERSION (второй исходник в csc).
[assembly: AssemblyTitle("Verus PC-Master")]
[assembly: AssemblyDescription("Честная диагностика и обслуживание ПК — переносной инструмент выездного мастера")]
[assembly: AssemblyCompany("androman.pro")]
[assembly: AssemblyProduct("Verus PC-Master")]
[assembly: AssemblyCopyright("© 2026 androman.pro")]

class VerusTray : ApplicationContext {
    private NotifyIcon ni;
    private string exeDir;

    [STAThread]
    static void Main(string[] args) {
        if (args != null && args.Length > 0 && IsStop(args[0])) { KillServer(); return; }
        Application.EnableVisualStyles();
        Application.Run(new VerusTray());
    }

    static bool IsStop(string a) {
        return a.Equals("/stop", StringComparison.OrdinalIgnoreCase)
            || a.Equals("stop", StringComparison.OrdinalIgnoreCase)
            || a.Equals("--stop", StringComparison.OrdinalIgnoreCase);
    }

    public VerusTray() {
        exeDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
        string server = Path.Combine(exeDir, "dashboard", "server.ps1");
        if (!File.Exists(server)) {
            MessageBox.Show("Не найден server.ps1 рядом с Verus.exe:\n" + server +
                "\n\nЗапускай Verus.exe из корня флешки (там, где папка dashboard).",
                "Verus PC-Master", MessageBoxButtons.OK, MessageBoxIcon.Error);
            ExitThread();
            return;
        }
        StartServer(server);

        ContextMenuStrip menu = new ContextMenuStrip();
        ToolStripMenuItem miOpen = new ToolStripMenuItem("Открыть дашборд");
        miOpen.Click += new EventHandler(OnOpen);
        miOpen.Font = new Font(miOpen.Font, System.Drawing.FontStyle.Bold);
        ToolStripMenuItem miRestart = new ToolStripMenuItem("Перезапустить");
        miRestart.Click += new EventHandler(OnRestart);
        ToolStripMenuItem miQuit = new ToolStripMenuItem("Выключить Verus");
        miQuit.Click += new EventHandler(OnQuit);
        menu.Items.Add(miOpen);
        menu.Items.Add(miRestart);
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add(miQuit);

        ni = new NotifyIcon();
        ni.Icon = LoadIcon();
        ni.Text = "Verus PC-Master — работает";
        ni.Visible = true;
        ni.ContextMenuStrip = menu;
        ni.DoubleClick += new EventHandler(OnOpen);
    }

    private Icon LoadIcon() {
        try { return Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch {}
        try { string p = Path.Combine(exeDir, "verus-icon.ico"); if (File.Exists(p)) return new Icon(p); } catch {}
        return SystemIcons.Application;
    }

    private void StartServer(string server) {
        try {
            ProcessStartInfo psi = new ProcessStartInfo("powershell.exe",
                "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + server + "\"");
            psi.UseShellExecute = false;   // трей уже elevated (манифест) → сервер наследует полный режим
            psi.CreateNoWindow = true;
            psi.WindowStyle = ProcessWindowStyle.Hidden;
            psi.WorkingDirectory = Path.Combine(exeDir, "dashboard");
            Process.Start(psi);
        } catch (Exception ex) {
            MessageBox.Show("Не удалось запустить сервер:\n" + ex.Message, "Verus PC-Master",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    // Открываем браузер через explorer.exe — так URL открывается НЕ из-под админа
    // (обычный браузер пользователя), как и делает сам server.ps1.
    private void OnOpen(object sender, EventArgs e) {
        try { Process.Start("explorer.exe", "http://localhost:8970/"); } catch {}
    }

    private void OnRestart(object sender, EventArgs e) {
        KillServer();
        System.Threading.Thread.Sleep(900);
        StartServer(Path.Combine(exeDir, "dashboard", "server.ps1"));
        System.Threading.Thread.Sleep(1500);
        OnOpen(sender, e);
    }

    private void OnQuit(object sender, EventArgs e) {
        KillServer();
        if (ni != null) { ni.Visible = false; ni.Dispose(); ni = null; }
        ExitThread();
    }

    static void KillServer() {
        try {
            string kill =
                "$p=(Get-NetTCPConnection -LocalPort 8970 -State Listen -ErrorAction SilentlyContinue|Select-Object -First 1 -ExpandProperty OwningProcess);" +
                "if($p){Stop-Process -Id $p -Force -ErrorAction SilentlyContinue};" +
                "Get-Process LibreHardwareMonitor -ErrorAction SilentlyContinue|Stop-Process -Force -ErrorAction SilentlyContinue";
            ProcessStartInfo psi = new ProcessStartInfo("powershell.exe",
                "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command \"" + kill + "\"");
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.WindowStyle = ProcessWindowStyle.Hidden;
            Process p2 = Process.Start(psi);
            if (p2 != null) p2.WaitForExit(5000);
        } catch {}
    }
}
