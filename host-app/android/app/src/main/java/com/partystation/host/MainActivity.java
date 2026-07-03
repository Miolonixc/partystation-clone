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

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String PREFS = "partystation";
    private static final String KEY_URL = "server_url";
    private static final String MAGIC = "PARTYSTATION";
    private static final int DISCOVERY_PORT = 41234;
    private static final int SERVER_PORT = 3000;
    private static final int TIMEOUT = 1500;

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
                // Try UDP discovery
                try {
                    DatagramSocket socket = new DatagramSocket();
                    socket.setSoTimeout(TIMEOUT);
                    socket.setBroadcast(true);

                    byte[] sendBuf = MAGIC.getBytes();
                    InetAddress broadcast = getBroadcastAddress();
                    DatagramPacket sendPacket = new DatagramPacket(
                        sendBuf, sendBuf.length, broadcast, DISCOVERY_PORT
                    );
                    socket.send(sendPacket);

                    byte[] recvBuf = new byte[1024];
                    DatagramPacket recvPacket = new DatagramPacket(recvBuf, recvBuf.length);
                    socket.receive(recvPacket);

                    String response = new String(recvPacket.getData(), 0, recvPacket.getLength());
                    if (response.contains(MAGIC)) {
                        org.json.JSONObject json = new org.json.JSONObject(response);
                        String ip = json.getString("ip");
                        int port = json.getInt("port");
                        final String url = "http://" + ip + ":" + port;
                        socket.close();
                        connectToServer(url);
                        return;
                    }
                    socket.close();
                } catch (Exception e) {}

                // Fallback: scan local network
                scanLocalNetwork();
            }
        }).start();
    }

    private void scanLocalNetwork() {
        try {
            WifiManager wifi = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            WifiInfo info = wifi.getConnectionInfo();
            int ip = info.getIpAddress();
            String baseIp = String.format("%d.%d.%d.",
                (ip & 0xFF),
                ((ip >> 8) & 0xFF),
                ((ip >> 16) & 0xFF));

            for (int i = 1; i < 255; i++) {
                final String url = "http://" + baseIp + i + ":3000";
                try {
                    HttpURLConnection conn = (HttpURLConnection) new URL(url + "/health").openConnection();
                    conn.setConnectTimeout(200);
                    conn.setReadTimeout(200);
                    int code = conn.getResponseCode();
                    conn.disconnect();
                    if (code == 200) {
                        connectToServer(url);
                        return;
                    }
                } catch (Exception e) {}
            }
        } catch (Exception e) {}

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                showUrlDialog();
            }
        });
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

    private InetAddress getBroadcastAddress() throws Exception {
        WifiManager wifi = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
        WifiInfo info = wifi.getConnectionInfo();
        int ip = info.getIpAddress();
        byte[] quads = new byte[4];
        quads[0] = (byte) (ip & 0xFF);
        quads[1] = (byte) ((ip >> 8) & 0xFF);
        quads[2] = (byte) ((ip >> 16) & 0xFF);
        quads[3] = (byte) 255;
        return InetAddress.getByAddress(quads);
    }

    private void showUrlDialog() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        layout.setPadding(pad, pad, pad, pad);

        TextView label = new TextView(this);
        label.setText("Адрес сервера:");
        label.setTextSize(16);
        layout.addView(label);

        final EditText input = new EditText(this);
        input.setHint("http://IP:3000");
        input.setTextSize(16);
        layout.addView(input);

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
                        getPrefs().edit().putString(KEY_URL, url).apply();
                        webView.loadUrl(url);
                    }
                }
            })
            .setNeutralButton("Искать снова", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    discoverServer();
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
