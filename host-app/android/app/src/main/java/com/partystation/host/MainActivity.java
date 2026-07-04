package com.partystation.host;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String PREFS = "partystation";
    private static final String KEY_URL = "server_url";
    private static final int TIMEOUT = 800;
    private long lastBackPress = 0;
    private static final long BACK_PRESS_INTERVAL = 2000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTheme(android.R.style.Theme_NoTitleBar_Fullscreen);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        String saved = getPrefs().getString(KEY_URL, null);
        if (saved != null) {
            if (!saved.contains("host=true")) {
                saved += saved.contains("?") ? "&host=true" : "?host=true";
            }
            tryConnect(saved);
        } else {
            discoverServer();
        }
    }

    private SharedPreferences getPrefs() { return getSharedPreferences(PREFS, MODE_PRIVATE); }

    private String getSubnet() {
        try {
            WifiManager w = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            int ip = w.getConnectionInfo().getIpAddress();
            return String.format("%d.%d.%d.", ip & 0xFF, (ip >> 8) & 0xFF, (ip >> 16) & 0xFF);
        } catch (Exception e) { return "192.168.1."; }
    }

    private void tryConnect(final String url) {
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setConnectTimeout(TIMEOUT); c.setReadTimeout(TIMEOUT);
                int code = c.getResponseCode(); c.disconnect();
                if (code == 200) { runOnUiThread(() -> webView.loadUrl(url)); return; }
            } catch (Exception e) {}
            runOnUiThread(this::discoverServer);
        }).start();
    }

    private void discoverServer() {
        webView.loadData(getSplashHtml(), "text/html", "UTF-8");
        new Thread(() -> {
            String sub = getSubnet();
            for (int port : new int[]{5173, 3000, 8080, 80}) {
                for (int i = 1; i < 255; i++) {
                    String url = "http://" + sub + i + ":" + port;
                    try {
                        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                        c.setConnectTimeout(300); c.setReadTimeout(300);
                        if (c.getResponseCode() == 200) { c.disconnect(); connectToServer(url); return; }
                        c.disconnect();
                    } catch (Exception e) {}
                }
            }
            runOnUiThread(this::showUrlDialog);
        }).start();
    }

    private void connectToServer(String url) {
        runOnUiThread(() -> {
            getPrefs().edit().putString(KEY_URL, url).apply();
            if (!url.contains("?")) url += "?host=true";
            else if (!url.contains("host=true")) url += "&host=true";
            webView.loadUrl(url);
        });
    }

    private void showUrlDialog() {
        String sub = getSubnet();
        LinearLayout lay = new LinearLayout(this);
        lay.setOrientation(LinearLayout.VERTICAL);
        int p = (int)(20 * getResources().getDisplayMetrics().density);
        lay.setPadding(p, p, p, p);
        TextView lbl = new TextView(this); lbl.setText("Адрес сервера:"); lbl.setTextSize(16); lay.addView(lbl);
        final EditText inp = new EditText(this); inp.setText(sub); inp.setTextSize(16); lay.addView(inp);
        TextView h = new TextView(this); h.setText("Введите IP (напр: " + sub + "1)"); h.setTextSize(12); h.setTextColor(0xFF888888); lay.addView(h);
        new AlertDialog.Builder(this).setTitle("PartyStation").setMessage("Сервер не найден:").setView(lay).setCancelable(false)
            .setPositiveButton("Подключить", (d, w) -> {
                String url = inp.getText().toString().trim();
                if (!url.isEmpty()) {
                    if (!url.startsWith("http")) url = "http://" + url;
                    if (!url.contains(":")) url += ":5173";
                    getPrefs().edit().putString(KEY_URL, url).apply();
                    webView.loadUrl(url);
                }
            }).show();
    }

    private String getSplashHtml() {
        return "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'><style>" +
            "body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;" +
            "background:linear-gradient(135deg,#1A1A2E,#16213E,#0F3460);font-family:sans-serif;color:#fff;text-align:center}" +
            ".c{display:flex;flex-direction:column;align-items:center;gap:16px}" +
            ".s{width:36px;height:36px;border:3px solid rgba(255,255,255,0.1);border-top-color:#6C63FF;border-radius:50%;animation:r 1s linear infinite}" +
            "@keyframes r{to{transform:rotate(360deg)}}</style></head><body><div class='c'>" +
            "<div style='font-size:64px'>🎮</div>" +
            "<div style='font-size:32px;font-weight:800'>PartyStation</div>" +
            "<div style='font-size:16px;color:#888'>Поиск сервера...</div>" +
            "<div class='s'></div></div></body></html>";
    }

    @Override
    public boolean onKeyDown(int k, KeyEvent e) {
        if (k == KeyEvent.KEYCODE_BACK) {
            long n = System.currentTimeMillis();
            if (n - lastBackPress < BACK_PRESS_INTERVAL) finish();
            else { lastBackPress = n; Toast.makeText(this, "Нажмите «Назад» ещё раз", Toast.LENGTH_SHORT).show(); }
            return true;
        }
        return super.onKeyDown(k, e);
    }

    @Override public void onBackPressed() {
        long n = System.currentTimeMillis();
        if (n - lastBackPress < BACK_PRESS_INTERVAL) finish();
        else { lastBackPress = n; Toast.makeText(this, "Нажмите «Назад» ещё раз", Toast.LENGTH_SHORT).show(); }
    }
}
