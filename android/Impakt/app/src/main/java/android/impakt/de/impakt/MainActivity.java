package android.impakt.de.impakt;

import android.content.Intent;
import android.support.v4.app.FragmentActivity;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Toast;

import net.gini.android.models.Extraction;
import net.gini.android.models.SpecificExtraction;
import net.gini.android.vision.BitmapFuture;
import net.gini.android.vision.CaptureActivity;
import net.gini.android.vision.ScannerActivity;

import org.jetbrains.annotations.NotNull;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


public class MainActivity extends ActionBarActivity {

    protected static final int IMAGE_REQUEST = 1;
    public static final String EXTRA_DOCUMENT = "document";
    public static final String EXTRA_EXTRACTIONS = "extractions";

    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = (Toolbar) findViewById(R.id.my_awesome_toolbar);
        setSupportActionBar(toolbar);
    }

    @NotNull
    private Map<String, SpecificExtraction> unpackExtractions(final Bundle extractionBundle) {
        Intent intent = getIntent();
        if (extractionBundle == null) {
            return null;
        }
        final Map<String, SpecificExtraction> extractionMap = new HashMap<>();
        for (String key: extractionBundle.keySet()){
            SpecificExtraction extraction = extractionBundle.getParcelable(key);
            extractionMap.put(key, extraction);
        }
        return extractionMap;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Bundle documentBundle;
        BitmapFuture originalFuture = null;
        BitmapFuture rectifiedFuture = null;

        if (requestCode == IMAGE_REQUEST && data != null) {
            documentBundle = data.getBundleExtra(ScannerActivity.EXTRA_DOCUMENT_BUNDLE);
            if (documentBundle != null) {
                originalFuture = documentBundle.getParcelable(CaptureActivity.EXTRA_ORIGINAL);
                rectifiedFuture = documentBundle.getParcelable(CaptureActivity.EXTRA_DOCUMENT);
            }
        }

        if (requestCode == IMAGE_REQUEST && resultCode == RESULT_OK) {
            final String imageFilename = getImageFilename();


            final Bundle extractionsBundle = data.getBundleExtra(EXTRA_EXTRACTIONS);
            final Map<String, SpecificExtraction> extractionMap = unpackExtractions(extractionsBundle);

            if (extractionMap != null && extractionMap.containsKey("amountToPay")) {
                final SpecificExtraction ex = extractionMap.get("amountToPay");
                final List<Extraction> candidate = ex.getCandidate();
                Log.d(TAG, "Price: " + ex.getValue());
            }
        } else if (requestCode == IMAGE_REQUEST && resultCode == ScannerActivity.RESULT_ERROR) {
            final ScannerActivity.Error error = data.getParcelableExtra(ScannerActivity.EXTRA_ERROR);
            final Toast toast = Toast.makeText(this, "Error! " + error.toString(), Toast.LENGTH_LONG);
            toast.show();
        } else if (requestCode == IMAGE_REQUEST && resultCode == UploadActivity.RESULT_UPLOAD_ERROR) {
            final String error = data.getStringExtra(UploadActivity.EXTRA_ERROR_STRING);
            final Toast toast = Toast.makeText(this, "Getting the extractions failed! " + error, Toast.LENGTH_LONG);
            toast.show();
        }
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        if (id == R.id.action_scan) {
            scanDocument();
        }

        return super.onOptionsItemSelected(item);
    }

    private String getImageFilename() {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:s", Locale.GERMANY).format(new Date());
    }

    public void scanDocument() {
        Intent scanIntent = new Intent(this, CaptureActivity.class);
        scanIntent.putExtra(CaptureActivity.EXTRA_STORE_ORIGINAL, false);
        scanIntent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
        CaptureActivity.setUploadActivityExtra(scanIntent, this, UploadActivity.class);
        startActivityForResult(scanIntent, IMAGE_REQUEST);
    }
}
