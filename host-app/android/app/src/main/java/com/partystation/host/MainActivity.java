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

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        String savedUrl = getPrefs().getString(KEY_URL, null);
        if (savedUrl != null) {
            tryConnect(savedUrl);
        } else {
            discoverServer();
        }
    }

    private SharedPreferences getPrefs() {
        return getSharedPreferences(PREFS, MODE_PRIVATE);
    }

    private String getSubnet() {
        try {
            WifiManager wifi = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            WifiInfo info = wifi.getConnectionInfo();
            int ip = info.getIpAddress();
            return String.format("%d.%d.%d.",
                (ip & 0xFF),
                ((ip >> 8) & 0xFF),
                ((ip >> 16) & 0xFF));
        } catch (Exception e) {
            return "192.168.1.";
        }
    }

    private void tryConnect(final String url) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    HttpURLConnection conn = (HttpURLConnection) new URL(url + "/health").openConnection();
                    conn.setConnectTimeout(TIMEOUT);
                    conn.setReadTimeout(TIMEOUT);
                    int code = conn.getResponseCode();
                    conn.disconnect();
                    if (code == 200) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                webView.loadUrl(url);
                            }
                        });
                        return;
                    }
                } catch (Exception e) {}
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        discoverServer();
                    }
                });
            }
        }).start();
    }

    private void discoverServer() {
        Toast.makeText(this, "Поиск сервера...", Toast.LENGTH_SHORT).show();

        new Thread(new Runnable() {
            @Override
            public void run() {
                String subnet = getSubnet();
                int[] ports = {5173, 3000, 8080, 80};

                for (int port : ports) {
                    for (int i = 1; i < 255; i++) {
                        final String url = "http://" + subnet + i + ":" + port;
                        try {
                            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                            conn.setConnectTimeout(300);
                            conn.setReadTimeout(300);
                            int code = conn.getResponseCode();
                            conn.disconnect();
                            if (code == 200) {
                                connectToServer(url);
                                return;
                            }
                        } catch (Exception e) {}
                    }
                }

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        showUrlDialog();
                    }
                });
            }
        }).start();
    }

    private void connectToServer(final String url) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                getPrefs().edit().putString(KEY_URL, url).apply();
                webView.loadUrl(url);
                Toast.makeText(MainActivity.this, "Сервер найден: " + url, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showUrlDialog() {
        String subnet = getSubnet();

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        layout.setPadding(pad, pad, pad, pad);

        TextView label = new TextView(this);
        label.setText("Адрес сервера:");
        label.setTextSize(16);
        layout.addView(label);

        final EditText input = new EditText(this);
        input.setText(subnet);
        input.setTextSize(16);
        layout.addView(input);

        TextView hint = new TextView(this);
        hint.setText("Введите IP сервера (например: " + subnet + "1)");
        hint.setTextSize(12);
        hint.setTextColor(0xFF888888);
        layout.addView(hint);

        new AlertDialog.Builder(this)
            .setTitle("PartyStation")
            .setMessage("Сервер не найден. Введите адрес:")
            .setView(layout)
            .setCancelable(false)
            .setPositiveButton("Подключить", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    String url = input.getText().toString().trim();
                    if (!url.isEmpty()) {
                        if (!url.startsWith("http")) {
                            url = "http://" + url;
                        }
                        if (!url.contains(":")) {
                            url = url + ":3000";
                        }
                        getPrefs().edit().putString(KEY_URL, url).apply();
                        webView.loadUrl(url);
                    }
                }
            })
            .show();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            long now = System.currentTimeMillis();
            if (now - lastBackPress < BACK_PRESS_INTERVAL) {
                finish();
            } else {
                lastBackPress = now;
                Toast.makeText(this, "Нажмите «Назад» ещё раз для выхода", Toast.LENGTH_SHORT).show();
            }
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onBackPressed() {
        long now = System.currentTimeMillis();
        if (now - lastBackPress < BACK_PRESS_INTERVAL) {
            finish();
        } else {
            lastBackPress = now;
            Toast.makeText(this, "Нажмите «Назад» ещё раз для выхода", Toast.LENGTH_SHORT).show();
        }
    }
}
